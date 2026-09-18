import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { parse, stringify } from 'yaml';
import { buildCatalogModel } from '../src/model.js';
import { generateCatalog } from '../src/index.js';

const roots: string[] = [];
const declaration = {
  id: 'inventory-stock-api', name: 'API de Estoque', version: '1.0.0',
  summary: 'API externa fictícia de reserva de estoque.',
  specification: 'stock-api.openapi.yaml', consumers: ['inventory-reserve-inventory'],
};
const spec = {
  openapi: '3.1.0', info: { title: 'API de Estoque', version: '1.0.0' },
  paths: { '/reservations': { post: {
    operationId: 'ReserveStock', 'x-kind': 'command', summary: 'Reserva no provedor externo.',
    requestBody: { required: true, content: { 'application/json': {
      schema: { type: 'object', required: ['orderId'], properties: { orderId: { type: 'string' } } },
      example: { orderId: 'order-123' },
    } } },
    responses: { '201': { description: 'Reserva criada.' } },
  } } },
};

async function fixture(change: (manifest: any, contract: any) => void = () => {}): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), 'eventcatalog-external-'));
  roots.push(root);
  await cp(path.resolve(import.meta.dirname, '../../architecture'), path.join(root, 'architecture'), { recursive: true });
  const file = path.join(root, 'architecture/domains/inventory/catalog.yaml');
  const manifest = parse(await readFile(file, 'utf8'));
  manifest.externalServices = [structuredClone(declaration)];
  const contract = structuredClone(spec);
  change(manifest, contract);
  await writeFile(file, stringify(manifest));
  await writeFile(path.join(root, 'architecture/domains/inventory/stock-api.openapi.yaml'), stringify(contract));
  return root;
}

afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

test('models external APIs independently from SAM Lambda services and SQS commands', async () => {
  const root = await fixture();
  const model = await buildCatalogModel(path.join(root, 'architecture'));
  expect(model.externalServices).toEqual([expect.objectContaining({
    ...declaration, domainId: 'inventory',
    operations: [expect.objectContaining({ id: 'ReserveStock', kind: 'command', method: 'POST', path: '/reservations' })],
  })]);
  expect(model.services).toHaveLength(6);
  expect(model.messages.find(message => message.id === 'ReserveInventory')?.channelId).toBe('inventory-commands');
});

test('renders a native external service, its HTTP contract and the consumer-to-provider relationship', async () => {
  const root = await fixture();
  const result = await generateCatalog({ catalogRoot: root });
  expect(result.resources).toContain('domains/inventory/services/inventory-stock-api/index.mdx');
  const provider = await readFile(path.join(root, 'domains/inventory/services/inventory-stock-api/index.mdx'), 'utf8');
  const providerMeta = parse(provider.split('---')[1]);
  expect(providerMeta.externalSystem).toBe(true);
  expect(providerMeta.receives).toContainEqual({ id: 'ReserveStock', version: '1.0.0' });
  expect(provider).not.toContain('template.yaml');
  const consumer = parse((await readFile(path.join(root, 'domains/inventory/services/inventory-reserve-inventory/index.mdx'), 'utf8')).split('---')[1]);
  expect(consumer.sends).toContainEqual({ id: 'ReserveStock', version: '1.0.0' });
  expect(consumer.receives).toContainEqual(expect.objectContaining({ id: 'ReserveInventory' }));
  expect(Object.keys(result.sourceHashes)).toContain('architecture/domains/inventory/stock-api.openapi.yaml');
  expect(JSON.parse(await readFile(path.join(root, 'commands/ReserveStock/schema.json'), 'utf8')).required).toContain('orderId');
  const flow = parse((await readFile(path.join(root, 'flows/CreateOrderFlow/index.mdx'), 'utf8')).split('---')[1]);
  expect(flow.steps).toContainEqual(expect.objectContaining({ service: { id: 'inventory-stock-api', version: '1.0.0' } }));
});

test.each([
  ['unknown consumer', (m: any) => { m.externalServices[0].consumers = ['missing-service']; }, /unknown consumer.*missing-service/i],
  ['escaping path', (m: any) => { m.externalServices[0].specification = '../orders/openapi.yaml'; }, /specification/i],
  ['missing contract', (m: any) => { m.externalServices[0].specification = 'missing.openapi.yaml'; }, /missing.openapi.yaml/i],
  ['duplicate service', (m: any) => { m.externalServices[0].id = 'inventory-reserve-inventory'; }, /duplicate service/i],
  ['duplicate operation', (_m: any, s: any) => { s.paths['/reservations'].post.operationId = 'CreateOrder'; }, /duplicate operationId/i],
  ['duplicate message', (_m: any, s: any) => { s.paths['/reservations'].post.operationId = 'ReserveInventory'; }, /duplicate message id/i],
  ['wrong contract version', (_m: any, s: any) => { s.info.version = '2.0.0'; }, /version/i],
  ['HTTP event', (_m: any, s: any) => { s.paths['/reservations'].post['x-kind'] = 'event'; }, /x-kind/i],
])('rejects %s before generating output', async (_name, change, error) => {
  const root = await fixture(change);
  await expect(buildCatalogModel(path.join(root, 'architecture'))).rejects.toThrow(error);
});
