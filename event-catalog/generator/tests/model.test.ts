import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { discoverSources } from '../src/discover.js';
import { buildCatalogModel } from '../src/model.js';

const catalogRoot = path.resolve(import.meta.dirname, '../..');
const temporaryDirectories: string[] = [];

async function temporaryArchitecture(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'eventcatalog-architecture-'));
  temporaryDirectories.push(directory);
  const source = path.join(catalogRoot, 'architecture');
  const target = path.join(directory, 'architecture');
  await import('node:fs/promises').then(({ cp }) => cp(source, target, { recursive: true }));
  return target;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('architecture model', () => {
  test('discovers one complete and deterministically sorted source set per domain', async () => {
    const sources = await discoverSources(path.join(catalogRoot, 'architecture'));
    expect(sources.map((source) => path.basename(source.directory))).toEqual(['inventory', 'notifications', 'orders']);
    expect(sources.every((source) => Object.values(source.files).length === 4)).toBe(true);
  });

  test('extracts HTTP queries and commands with their explicit SAM resources', async () => {
    const model = await buildCatalogModel(path.join(catalogRoot, 'architecture'));
    expect(model.operations.find((operation) => operation.id === 'GetOrderById')).toMatchObject({
      kind: 'query',
      method: 'GET',
      path: '/orders/{orderId}',
      serviceId: 'orders-get-order-by-id',
      resourceLogicalId: 'GetOrderByIdFunction',
    });
    expect(model.operations.find((operation) => operation.id === 'CreateOrder')).toMatchObject({
      kind: 'command',
      outcomes: ['OrderCreated'],
      serviceId: 'orders-create-order',
      resourceLogicalId: 'CreateOrderFunction',
    });
  });

  test('extracts Lambda functions as services and DynamoDB tables as data stores', async () => {
    const model = await buildCatalogModel(path.join(catalogRoot, 'architecture'));
    expect(model.services.map((service) => service.id)).toEqual([
      'inventory-get-inventory-by-sku',
      'inventory-reserve-inventory',
      'notifications-get-notifications-by-order-id',
      'notifications-order-created-consumer',
      'orders-create-order',
      'orders-get-order-by-id',
    ]);
    expect(model.dataStores.map((dataStore) => dataStore.id)).toEqual([
      'inventory-table',
      'notifications-table',
      'orders-table',
    ]);
    expect(model.services.find((service) => service.id === 'orders-create-order')).toMatchObject({
      logicalId: 'CreateOrderFunction',
      readsFrom: ['orders-table'],
      writesTo: ['orders-table'],
    });
    expect(model.services.find((service) => service.id === 'orders-get-order-by-id')).toMatchObject({
      readsFrom: ['orders-table'],
      writesTo: [],
    });
    expect(model.services.find((service) => service.id === 'inventory-reserve-inventory')).toMatchObject({
      readsFrom: ['inventory-table'],
      writesTo: ['inventory-table'],
    });
  });

  test('extracts the SQS command and EventBridge event relative to each Lambda service', async () => {
    const model = await buildCatalogModel(path.join(catalogRoot, 'architecture'));
    expect(model.messages).toHaveLength(2);
    expect(model.messages.find((message) => message.id === 'OrderCreated')).toMatchObject({
      id: 'OrderCreated',
      kind: 'event',
      wireName: 'orders.order-created.v1',
      producerServiceId: 'orders-create-order',
      channelId: 'application-events',
    });
    expect(model.messages.find((message) => message.id === 'ReserveInventory')).toMatchObject({
      kind: 'command',
      wireName: 'inventory.reserve.v1',
      producerServiceId: 'orders-create-order',
      channelId: 'inventory-commands',
    });
    expect(model.relationships.filter((relationship) => relationship.messageId === 'OrderCreated')).toEqual([
      expect.objectContaining({ direction: 'receive', serviceId: 'notifications-order-created-consumer' }),
      expect.objectContaining({ direction: 'send', serviceId: 'orders-create-order' }),
    ]);
    expect(model.relationships.filter((relationship) => relationship.messageId === 'ReserveInventory')).toEqual([
      expect.objectContaining({ direction: 'receive', serviceId: 'inventory-reserve-inventory' }),
      expect.objectContaining({ direction: 'send', serviceId: 'orders-create-order' }),
    ]);
    expect(model.channels.find((channel) => channel.id === 'inventory-commands')).toMatchObject({ protocol: 'sqs' });
    expect(model.channels.find((channel) => channel.id === 'application-events')).toMatchObject({ protocol: 'eventbridge' });
  });

  test('extracts resources from all three SAM templates', async () => {
    const model = await buildCatalogModel(path.join(catalogRoot, 'architecture'));
    expect(model.awsResources.filter((resource) => resource.domainId === 'orders').map((resource) => resource.logicalId)).toContain('ApplicationEventBus');
    expect(model.awsResources.filter((resource) => resource.domainId === 'inventory').map((resource) => resource.logicalId)).toContain('InventoryTable');
    expect(model.awsResources.filter((resource) => resource.domainId === 'notifications').map((resource) => resource.logicalId)).toContain('OrderCreatedRule');
  });

  test('rejects invalid architecture classifications with file and field path', async () => {
    const root = await temporaryArchitecture();
    const file = path.join(root, 'domains/orders/openapi.yaml');
    await writeFile(file, (await readFile(file, 'utf8')).replace('x-kind: query', 'x-kind: event'));
    await expect(buildCatalogModel(root)).rejects.toThrow(/openapi\.yaml.*paths\.\/orders\/\{orderId\}\.get\.x-kind/s);
  });

  test('rejects duplicate operation ids', async () => {
    const root = await temporaryArchitecture();
    const file = path.join(root, 'domains/inventory/openapi.yaml');
    await writeFile(file, (await readFile(file, 'utf8')).replace('GetInventoryBySku', 'GetOrderById'));
    await expect(buildCatalogModel(root)).rejects.toThrow(/duplicate operationId GetOrderById/i);
  });

  test('rejects contract titles incompatible with the service manifest', async () => {
    const root = await temporaryArchitecture();
    const file = path.join(root, 'domains/orders/openapi.yaml');
    await writeFile(file, (await readFile(file, 'utf8')).replace('Orders Service API', 'Payments Service API'));
    await expect(buildCatalogModel(root)).rejects.toThrow(/OpenAPI title.*Orders Service/i);
  });

  test('rejects unresolved and escaping local references', async () => {
    const root = await temporaryArchitecture();
    const file = path.join(root, 'domains/inventory/asyncapi.yaml');
    const original = await readFile(file, 'utf8');
    await writeFile(file, original.replace('../orders/asyncapi.yaml', '../missing/asyncapi.yaml'));
    await expect(buildCatalogModel(root)).rejects.toThrow(/reference.*does not exist/i);
    await writeFile(file, original.replace('../orders/asyncapi.yaml', '../../../../outside.yaml'));
    await expect(buildCatalogModel(root)).rejects.toThrow(/outside architecture/i);
  });

  test('rejects wire major versions, outcomes, and SAM logical ids that do not resolve', async () => {
    const root = await temporaryArchitecture();
    const asyncFile = path.join(root, 'domains/orders/asyncapi.yaml');
    const openapiFile = path.join(root, 'domains/orders/openapi.yaml');
    await writeFile(asyncFile, (await readFile(asyncFile, 'utf8')).replace('orders.order-created.v1', 'orders.order-created.v2'));
    await expect(buildCatalogModel(root)).rejects.toThrow(/wire version.*1\.0\.0/i);
    await writeFile(asyncFile, (await readFile(asyncFile, 'utf8')).replace('orders.order-created.v2', 'orders.order-created.v1'));
    await writeFile(openapiFile, (await readFile(openapiFile, 'utf8')).replace('OrderCreated\n', 'UnknownEvent\n'));
    await expect(buildCatalogModel(root)).rejects.toThrow(/outcome UnknownEvent/i);
    await writeFile(openapiFile, (await readFile(openapiFile, 'utf8')).replace('UnknownEvent\n', 'OrderCreated\n').replace('CreateOrderFunction', 'MissingFunction'));
    await expect(buildCatalogModel(root)).rejects.toThrow(/SAM resource MissingFunction/i);
  });
});
