import { createHash } from 'node:crypto';
import { cp, mkdtemp, mkdir, readFile, readdir, rename, rm, rmdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import eventCatalogSdk, { type Channel, type Command, type Domain, type Event, type Flow, type Query, type Service, type Team } from '@eventcatalog/sdk';
import type { CatalogModel, ServiceModel } from './model.js';
import type { OperationModel } from './parse-openapi.js';

const generatedNotice = '<!-- Generated from architecture/. Do not edit manually. -->';
const manifestName = '.eventcatalog-generated.json';
type WriteOptions = { path?: string; override?: boolean };
interface CatalogWriter {
  writeTeam(team: Team, options?: { override?: boolean }): Promise<void>;
  writeDomain(domain: Domain, options?: WriteOptions): Promise<void>;
  writeService(service: Service, options?: WriteOptions): Promise<void>;
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

function awsTable(model: CatalogModel, service: ServiceModel): string {
  const rows = model.awsResources
    .filter((resource) => resource.domainId === service.domainId)
    .map((resource) => `| \`${resource.logicalId}\` | \`${resource.type}\` | ${resource.references.map((item) => `\`${item}\``).join(', ') || '—'} |`)
    .join('\n');
  return `Os recursos abaixo são extraídos do [template AWS SAM](./template.yaml) e são apenas documentais nesta versão.\n\n| Logical ID | Tipo | Referências explícitas |\n|---|---|---|\n${rows}`;
}

function operationResource(operation: OperationModel): Command | Query {
  const base = {
    id: operation.id,
    name: operation.name,
    version: operation.version,
    summary: operation.summary,
    owners: [`${operation.domainId}-team`],
    operation: { method: operation.method, path: operation.path, statusCodes: operation.statusCodes },
    schemaPath: operation.schema ? 'schema.json' : undefined,
    markdown: markdown('Semântica', `${operation.kind === 'command' ? 'Command' : 'Query'} HTTP implementada conceitualmente por \`${operation.resourceLogicalId}\`.`),
  };
  return base;
}

async function attachOperationAssets(stage: string, operation: OperationModel): Promise<void> {
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
      services: [{ id: domain.service.id, version: domain.service.version }],
      sends: model.relationships.filter((item) => item.domainId === domain.id && item.direction === 'send').map((item) => ({ id: item.messageId, version: '1.0.0' })),
      receives: model.relationships.filter((item) => item.domainId === domain.id && item.direction === 'receive').map((item) => ({ id: item.messageId, version: '1.0.0' })),
      flows: domain.id === 'orders' ? [{ id: 'CreateOrderFlow', version: '1.0.0' }] : [],
      markdown: markdown('Limite de negócio', domain.summary),
    };
    await sdk.writeDomain(domainResource, { path: domain.id, override: true });
  }

  for (const service of model.services) {
    const serviceResource: Service = {
      id: service.id,
      name: service.name,
      version: service.version,
      summary: service.summary,
      owners: service.owners,
      sends: serviceMessages(model, service.id, 'send'),
      receives: [
        ...serviceMessages(model, service.id, 'receive'),
        ...model.operations.filter((operation) => operation.serviceId === service.id).map((operation) => ({ id: operation.id, version: operation.version })),
      ],
      specifications: [
        { type: 'openapi', path: 'openapi.yaml', name: 'OpenAPI 3.1' },
        { type: 'asyncapi', path: 'asyncapi.yaml', name: 'AsyncAPI 3.0' },
      ],
      flows: service.id === 'orders-service' ? [{ id: 'CreateOrderFlow', version: '1.0.0' }] : [],
      markdown: markdown('Recursos AWS', awsTable(model, service)),
    };
    const nestedSdk = createSdk(path.join(stage, 'domains', service.domainId));
    await nestedSdk.writeService(serviceResource, { path: service.id, override: true });
    for (const contract of ['openapi.yaml', 'asyncapi.yaml', 'template.yaml'] as const) {
      await sdk.addFileToService(service.id, { content: await readFile(service.source.files[contract], 'utf8'), fileName: contract }, service.version);
    }
  }

  for (const operation of model.operations) {
    const resource = operationResource(operation);
    if (operation.kind === 'command') await sdk.writeCommand(resource as Command, { path: operation.id, override: true });
    else await sdk.writeQuery(resource as Query, { path: operation.id, override: true });
    await attachOperationAssets(stage, operation);
  }

  for (const message of model.messages) {
    const event: Event = {
      id: message.id,
      name: message.name,
      version: message.version,
      summary: message.summary,
      owners: [`${message.producerDomainId}-team`],
      schemaPath: 'schema.json',
      channels: [{ id: message.channelId, version: '1.0.0' }],
      markdown: markdown('Contrato no wire', `Nome do fato no EventBridge: \`${message.wireName}\`.\n\nProduzido por \`${message.producerServiceId}\` e consumido por ${model.relationships.filter((item) => item.messageId === message.id && item.direction === 'receive').map((item) => `\`${item.serviceId}\``).join(' e ')}.`),
      'x-wire-name': message.wireName,
    };
    await sdk.writeEvent(event, { path: message.id, override: true });
    await sdk.addSchemaToEvent(message.id, { schema: `${JSON.stringify(message.payload, null, 2)}\n`, fileName: 'schema.json' }, message.version);
    if (message.example) await sdk.addExampleToEvent(message.id, { content: `${JSON.stringify(message.example, null, 2)}\n`, fileName: 'example.json' }, message.version);
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
      owners: ['orders-team'],
      markdown: markdown('Transporte', `EventBridge custom bus representado por \`${channel.resourceLogicalId}\`. Duplicatas são esperadas; consumidores devem ser idempotentes.`),
      'x-aws-resource': `${channel.resourceDomainId}:${channel.resourceLogicalId}`,
    };
    await sdk.writeChannel(resource, { path: channel.id, override: true });
  }

  const flow: Flow = {
    id: 'CreateOrderFlow',
    name: 'Create Order Flow',
    version: '1.0.0',
    summary: 'Do aceite do comando à reação dos consumidores de OrderCreated.',
    owners: ['orders-team'],
    steps: [
      { id: 'command', title: 'Create order', message: { id: 'CreateOrder', version: '1.0.0' }, next_step: 'accepted' },
      { id: 'accepted', title: 'Pedido aceito?', custom: { title: 'Pedido aceito?', type: 'Decision', color: 'orange', summary: 'A relação causal vem de x-architecture-outcomes.' }, next_step: { id: 'event', label: 'sim' } },
      { id: 'event', title: 'Order created', message: { id: 'OrderCreated', version: '1.0.0' }, next_steps: [{ id: 'inventory', label: 'reservar estoque' }, { id: 'notifications', label: 'preparar notificação' }] },
      { id: 'inventory', title: 'Inventory Service', service: { id: 'inventory-service', version: '1.0.0' } },
      { id: 'notifications', title: 'Notifications Service', service: { id: 'notifications-service', version: '1.0.0' } },
    ],
    markdown: markdown('Origem', 'Fluxo derivado do outcome explícito de `CreateOrder` e das operações AsyncAPI que recebem `OrderCreated`.'),
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
  const files = [...new Set(model.domains.flatMap((domain) => Object.values(domain.source.files)))].sort();
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
