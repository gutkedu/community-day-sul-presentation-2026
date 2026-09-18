import { createHash } from 'node:crypto';
import { cp, mkdtemp, mkdir, readFile, readdir, rename, rm, rmdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import eventCatalogSdk, { type Channel, type Command, type Container, type Domain, type Event, type Flow, type Query, type Service, type Team } from '@eventcatalog/sdk';
import type { CatalogModel, ServiceModel } from './model.js';
import type { OperationModel } from './parse-openapi.js';
import type { ExternalOperation } from './external-services.js';

const generatedNotice = '<!-- Generated from architecture/. Do not edit manually. -->';
const manifestName = '.eventcatalog-generated.json';
type WriteOptions = { path?: string; override?: boolean };
interface CatalogWriter {
  writeTeam(team: Team, options?: { override?: boolean }): Promise<void>;
  writeDomain(domain: Domain, options?: WriteOptions): Promise<void>;
  writeService(service: Service, options?: WriteOptions): Promise<void>;
  writeDataStore(dataStore: Container, options?: WriteOptions): Promise<void>;
  addFileToService(id: string, file: { content: string; fileName: string }, version?: string): Promise<void>;
  writeCommand(command: Command, options?: WriteOptions): Promise<void>;
  writeQuery(query: Query, options?: WriteOptions): Promise<void>;
  writeEvent(event: Event, options?: WriteOptions): Promise<void>;
  writeChannel(channel: Channel, options?: WriteOptions): Promise<void>;
  writeFlow(flow: Flow, options?: WriteOptions): Promise<void>;
  addSchemaToCommand(id: string, schema: { schema: string; fileName: string }, version?: string): Promise<void>;
  addSchemaToQuery(id: string, schema: { schema: string; fileName: string }, version?: string): Promise<void>;
  addSchemaToEvent(id: string, schema: { schema: string; fileName: string }, version?: string): Promise<void>;
  addExampleToCommand(id: string, example: { content: string; fileName: string }, version?: string): Promise<void>;
  addExampleToQuery(id: string, example: { content: string; fileName: string }, version?: string): Promise<void>;
  addExampleToEvent(id: string, example: { content: string; fileName: string }, version?: string): Promise<void>;
}
const createSdk = eventCatalogSdk as unknown as (catalogPath: string) => CatalogWriter;

interface GenerationManifest {
  version: 1;
  sourceHashes: Record<string, string>;
  resources: string[];
}

function markdown(title: string, body: string): string {
  return `${generatedNotice}\n\n## ${title}\n\n${body}`;
}

function serviceMessages(model: CatalogModel, serviceId: string, direction: 'send' | 'receive') {
  return model.relationships
    .filter((relationship) => relationship.serviceId === serviceId && relationship.direction === direction)
    .map((relationship) => ({
      id: relationship.messageId,
      version: model.messages.find((message) => message.id === relationship.messageId)!.version,
      [direction === 'send' ? 'to' : 'from']: [{ id: relationship.channelId, version: '1.0.0' }],
    }));
}

function serviceMarkdown(service: ServiceModel): string {
  const relationships = [
    service.readsFrom.length > 0 ? `Lê de ${service.readsFrom.map((id) => `\`${id}\``).join(', ')}.` : '',
    service.writesTo.length > 0 ? `Escreve em ${service.writesTo.map((id) => `\`${id}\``).join(', ')}.` : '',
  ].filter(Boolean).join(' ');
  return markdown('Componente de serviço', `Lambda \`${service.logicalId}\` extraída do [AWS SAM](./template.yaml).${relationships ? `\n\n${relationships}` : ''}`);
}

function operationResource(operation: OperationModel | ExternalOperation): Command | Query {
  const base = {
    id: operation.id,
    name: operation.name,
    version: operation.version,
    summary: operation.summary,
    owners: [`${operation.domainId}-team`],
    operation: { method: operation.method, path: operation.path, statusCodes: operation.statusCodes },
    schemaPath: operation.schema ? 'schema.json' : undefined,
    markdown: markdown('Semântica', 'resourceLogicalId' in operation
      ? `${operation.kind === 'command' ? 'Command' : 'Query'} HTTP implementada conceitualmente por \`${operation.resourceLogicalId}\`.`
      : `${operation.kind === 'command' ? 'Command' : 'Query'} HTTP oferecida pela API externa \`${operation.serviceId}\`. Contrato fictício e documental, sem serviço implantado. Não é a mensagem recebida por SQS.`),
  };
  return base;
}

async function attachOperationAssets(stage: string, operation: OperationModel | ExternalOperation): Promise<void> {
  const sdk = createSdk(stage);
  if (operation.schema) {
    const schema = { schema: `${JSON.stringify(operation.schema, null, 2)}\n`, fileName: 'schema.json' };
    if (operation.kind === 'command') await sdk.addSchemaToCommand(operation.id, schema, operation.version);
    else await sdk.addSchemaToQuery(operation.id, schema, operation.version);
  }
  if (operation.example) {
    const example = { content: `${JSON.stringify(operation.example, null, 2)}\n`, fileName: 'example.json' };
    if (operation.kind === 'command') await sdk.addExampleToCommand(operation.id, example, operation.version);
    else await sdk.addExampleToQuery(operation.id, example, operation.version);
  }
}

async function renderStage(stage: string, model: CatalogModel): Promise<void> {
  const sdk = createSdk(stage);
  await mkdir(path.join(stage, 'teams'), { recursive: true });

  for (const domain of model.domains) {
    await sdk.writeTeam({
      id: domain.owners[0],
      name: `${domain.name} Team`,
      summary: `Time fictício responsável por ${domain.name}.`,
      markdown: markdown('Responsabilidade', `Mantém os contratos públicos do domínio ${domain.name}.`),
    }, { override: true });
    const domainResource: Domain = {
      id: domain.id,
      name: domain.name,
      version: domain.version,
      summary: domain.summary,
      owners: domain.owners,
      services: [...model.services, ...model.externalServices].filter((service) => service.domainId === domain.id).map((service) => ({ id: service.id, version: service.version })),
      sends: model.relationships.filter((item) => item.domainId === domain.id && item.direction === 'send').map((item) => ({ id: item.messageId, version: '1.0.0' })),
      receives: model.relationships.filter((item) => item.domainId === domain.id && item.direction === 'receive').map((item) => ({ id: item.messageId, version: '1.0.0' })),
      flows: domain.id === 'orders' ? [{ id: 'CreateOrderFlow', version: '1.0.0' }] : [],
      markdown: markdown('Limite de negócio', domain.summary),
    };
    await sdk.writeDomain(domainResource, { path: domain.id, override: true });
  }

  for (const service of model.services) {
    const hasOpenApi = model.operations.some((operation) => operation.serviceId === service.id);
    const hasAsyncApi = model.relationships.some((relationship) => relationship.serviceId === service.id);
    const serviceResource: Service = {
      id: service.id,
      name: service.name,
      version: service.version,
      summary: service.summary,
      owners: service.owners,
      sends: [
        ...serviceMessages(model, service.id, 'send'),
        ...model.externalServices.filter(external => external.consumers.includes(service.id))
          .flatMap(external => external.operations.map(operation => ({ id: operation.id, version: operation.version }))),
      ],
      receives: [
        ...serviceMessages(model, service.id, 'receive'),
        ...model.operations.filter((operation) => operation.serviceId === service.id).map((operation) => ({ id: operation.id, version: operation.version })),
      ],
      writesTo: service.writesTo.map((id) => ({ id, version: '1.0.0' })),
      readsFrom: service.readsFrom.map((id) => ({ id, version: '1.0.0' })),
      specifications: [
        ...(hasOpenApi ? [{ type: 'openapi' as const, path: 'openapi.yaml', name: 'OpenAPI 3.1' }] : []),
        ...(hasAsyncApi ? [{ type: 'asyncapi' as const, path: 'asyncapi.yaml', name: 'AsyncAPI 3.0' }] : []),
      ],
      flows: service.id === 'orders-create-order' ? [{ id: 'CreateOrderFlow', version: '1.0.0' }] : [],
      markdown: serviceMarkdown(service),
    };
    const nestedSdk = createSdk(path.join(stage, 'domains', service.domainId));
    await nestedSdk.writeService(serviceResource, { path: service.id, override: true });
    const contracts = [
      ...(hasOpenApi ? ['openapi.yaml' as const] : []),
      ...(hasAsyncApi ? ['asyncapi.yaml' as const] : []),
      'template.yaml' as const,
    ];
    for (const contract of contracts) {
      await sdk.addFileToService(service.id, { content: await readFile(service.source.files[contract], 'utf8'), fileName: contract }, service.version);
    }
  }

  for (const external of model.externalServices) {
    const nestedSdk = createSdk(path.join(stage, 'domains', external.domainId));
    await nestedSdk.writeService({
      id: external.id, name: external.name, version: external.version,
      summary: external.summary, owners: external.owners, externalSystem: true,
      receives: external.operations.map(operation => ({ id: operation.id, version: operation.version })),
      specifications: [{ type: 'openapi', path: 'openapi.yaml', name: 'OpenAPI 3.1 — API externa' }],
      markdown: markdown('Integração externa', `API de terceiro fictícia, fora da infraestrutura SAM. O time listado mantém a integração, não a implementação do provedor.\n\nConsumida por ${external.consumers.map(id => `\`${id}\``).join(', ')}. O consumidor recebe ReserveInventory via SQS e chama a API por HTTP usando ReserveStock.\n\n<NodeGraph />`),
    }, { path: external.id, override: true });
    await sdk.addFileToService(external.id, { content: await readFile(external.sourceFile, 'utf8'), fileName: 'openapi.yaml' }, external.version);
  }

  for (const dataStore of model.dataStores) {
    await sdk.writeDataStore({
      id: dataStore.id,
      name: dataStore.name,
      version: dataStore.version,
      summary: dataStore.summary,
      owners: [`${dataStore.domainId}-team`],
      container_type: dataStore.containerType,
      technology: dataStore.technology,
      authoritative: true,
      markdown: markdown('Infraestrutura', `Tabela \`${dataStore.logicalId}\` extraída do AWS SAM.`),
    }, { path: dataStore.id, override: true });
  }

  for (const operation of [...model.operations, ...model.externalServices.flatMap(service => service.operations)]) {
    const resource = operationResource(operation);
    if (operation.kind === 'command') await sdk.writeCommand(resource as Command, { path: operation.id, override: true });
    else await sdk.writeQuery(resource as Query, { path: operation.id, override: true });
    await attachOperationAssets(stage, operation);
  }

  for (const message of model.messages) {
    const resource = {
      id: message.id,
      name: message.name,
      version: message.version,
      summary: message.summary,
      owners: [`${message.producerDomainId}-team`],
      schemaPath: 'schema.json',
      channels: [{ id: message.channelId, version: '1.0.0' }],
      markdown: markdown('Contrato no wire', `Nome da mensagem: \`${message.wireName}\`.\n\nProduzida por \`${message.producerServiceId}\` e consumida por ${model.relationships.filter((item) => item.messageId === message.id && item.direction === 'receive').map((item) => `\`${item.serviceId}\``).join(' e ')}.`),
      'x-wire-name': message.wireName,
    };
    const schema = { schema: `${JSON.stringify(message.payload, null, 2)}\n`, fileName: 'schema.json' };
    const example = message.example ? { content: `${JSON.stringify(message.example, null, 2)}\n`, fileName: 'example.json' } : undefined;
    if (message.kind === 'event') {
      await sdk.writeEvent(resource as Event, { path: message.id, override: true });
      await sdk.addSchemaToEvent(message.id, schema, message.version);
      if (example) await sdk.addExampleToEvent(message.id, example, message.version);
    } else {
      await sdk.writeCommand(resource as Command, { path: message.id, override: true });
      await sdk.addSchemaToCommand(message.id, schema, message.version);
      if (example) await sdk.addExampleToCommand(message.id, example, message.version);
    }
  }

  for (const channel of model.channels) {
    const resource: Channel = {
      id: channel.id,
      name: channel.name,
      version: channel.version,
      summary: channel.summary,
      address: channel.address,
      protocols: [channel.protocol],
      deliveryGuarantee: 'at-least-once',
      owners: [`${channel.resourceDomainId}-team`],
      markdown: markdown('Transporte', `${channel.protocol === 'sqs' ? 'Fila SQS' : 'EventBridge custom bus'} representado por \`${channel.resourceLogicalId}\`. Duplicatas são esperadas; consumidores devem ser idempotentes.`),
      'x-aws-resource': `${channel.resourceDomainId}:${channel.resourceLogicalId}`,
    };
    await sdk.writeChannel(resource, { path: channel.id, override: true });
  }

  const flow: Flow = {
    id: 'CreateOrderFlow',
    name: 'Create Order Flow',
    version: '1.0.0',
    summary: 'Da criação do pedido aos comandos e eventos enviados para outros serviços.',
    owners: ['orders-team'],
    steps: [
      { id: 'command', title: 'Create order', message: { id: 'CreateOrder', version: '1.0.0' }, next_step: 'orders' },
      { id: 'orders', title: 'Create Order', service: { id: 'orders-create-order', version: '1.0.0' }, next_steps: ['reserve-command', 'event'] },
      { id: 'reserve-command', title: 'Reserve inventory', message: { id: 'ReserveInventory', version: '1.0.0' }, next_step: 'inventory' },
      { id: 'inventory', title: 'Reserve Inventory', service: { id: 'inventory-reserve-inventory', version: '1.0.0' },
        ...(model.externalServices.some(service => service.id === 'inventory-stock-api' && service.operations.some(operation => operation.id === 'ReserveStock'))
          ? { next_step: 'reserve-stock' } : {}) },
      ...model.externalServices.filter(service => service.id === 'inventory-stock-api' && service.operations.some(operation => operation.id === 'ReserveStock')).flatMap(service => [
        { id: 'reserve-stock', title: 'Reserva via HTTP', message: { id: 'ReserveStock', version: service.version }, next_step: 'stock-api' },
        { id: 'stock-api', title: service.name, service: { id: service.id, version: service.version } },
      ]),
      { id: 'event', title: 'Order created', message: { id: 'OrderCreated', version: '1.0.0' }, next_step: 'notifications' },
      { id: 'notifications', title: 'Order Created Consumer', service: { id: 'notifications-order-created-consumer', version: '1.0.0' } },
    ],
    markdown: markdown('Origem', 'Fluxo derivado das operações OpenAPI e AsyncAPI, sem decisões artificiais.'),
  };
  await sdk.writeFlow(flow, { path: 'CreateOrderFlow', override: true });
}

async function listFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  async function walk(directory: string): Promise<void> {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else files.push(path.relative(root, absolute).split(path.sep).join('/'));
    }
  }
  await walk(root);
  return files.sort();
}

async function sourceHashes(catalogRoot: string, model: CatalogModel): Promise<Record<string, string>> {
  const files = [...new Set([
    ...model.domains.flatMap((domain) => Object.values(domain.source.files)),
    ...model.externalServices.map(service => service.sourceFile),
  ])].sort();
  const hashes: Record<string, string> = {};
  for (const file of files) {
    hashes[path.relative(catalogRoot, file).split(path.sep).join('/')] = createHash('sha256').update(await readFile(file)).digest('hex');
  }
  return hashes;
}

async function readManifest(catalogRoot: string): Promise<GenerationManifest | undefined> {
  try {
    return JSON.parse(await readFile(path.join(catalogRoot, manifestName), 'utf8')) as GenerationManifest;
  } catch (error: any) {
    if (error?.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function removeEmptyParents(file: string, catalogRoot: string): Promise<void> {
  let directory = path.dirname(file);
  while (directory !== catalogRoot && directory.startsWith(catalogRoot)) {
    try { await rmdir(directory); } catch { return; }
    directory = path.dirname(directory);
  }
}

export async function renderCatalog(catalogRoot: string, model: CatalogModel): Promise<GenerationManifest> {
  const stageParent = await mkdtemp(path.join(tmpdir(), 'eventcatalog-stage-'));
  const stage = path.join(stageParent, 'catalog');
  await mkdir(stage, { recursive: true });
  try {
    await renderStage(stage, model);
    const resources = await listFiles(stage);
    const previous = await readManifest(catalogRoot);
    for (const resource of resources) {
      const source = path.join(stage, resource);
      const destination = path.join(catalogRoot, resource);
      await mkdir(path.dirname(destination), { recursive: true });
      const temporary = `${destination}.generated-tmp`;
      await cp(source, temporary);
      await rename(temporary, destination);
    }
    for (const stale of previous?.resources ?? []) {
      if (resources.includes(stale)) continue;
      const absolute = path.join(catalogRoot, stale);
      const relative = path.relative(catalogRoot, absolute);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Refusing to remove manifest path outside catalog: ${stale}`);
      await rm(absolute, { force: true });
      await removeEmptyParents(absolute, catalogRoot);
    }
    const manifest: GenerationManifest = { version: 1, sourceHashes: await sourceHashes(catalogRoot, model), resources };
    await writeFile(path.join(catalogRoot, manifestName), `${JSON.stringify(manifest, null, 2)}\n`);
    return manifest;
  } finally {
    await rm(stageParent, { recursive: true, force: true });
  }
}
