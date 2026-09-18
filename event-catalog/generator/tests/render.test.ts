import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { generateCatalog } from '../src/index.js';

const sourceCatalog = path.resolve(import.meta.dirname, '../..');
const temporaryDirectories: string[] = [];

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), 'eventcatalog-render-'));
  temporaryDirectories.push(root);
  await cp(path.join(sourceCatalog, 'architecture'), path.join(root, 'architecture'), { recursive: true });
  await writeFile(path.join(root, 'manual-marker.txt'), 'preserve me\n');
  return root;
}

async function snapshot(root: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  async function walk(directory: string): Promise<void> {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === 'architecture' || entry.name === 'node_modules') continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else result[path.relative(root, absolute)] = await readFile(absolute, 'utf8');
    }
  }
  await walk(root);
  return result;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('catalog rendering', () => {
  test('generates domains, services, messages, channel, flow, relationships, schemas, and contracts', async () => {
    const root = await fixture();
    const result = await generateCatalog({ catalogRoot: root });
    expect(result.resources).toEqual(expect.arrayContaining([
      'domains/orders/index.mdx',
      'domains/orders/services/orders-create-order/index.mdx',
      'domains/inventory/services/inventory-reserve-inventory/index.mdx',
      'domains/notifications/services/notifications-order-created-consumer/index.mdx',
      'containers/orders-table/index.mdx',
      'containers/inventory-table/index.mdx',
      'containers/notifications-table/index.mdx',
      'commands/CreateOrder/index.mdx',
      'commands/ReserveInventory/index.mdx',
      'queries/GetOrderById/index.mdx',
      'events/OrderCreated/index.mdx',
      'channels/application-events/index.mdx',
      'channels/inventory-commands/index.mdx',
      'flows/CreateOrderFlow/index.mdx',
    ]));
    const ordersService = await readFile(path.join(root, 'domains/orders/services/orders-create-order/index.mdx'), 'utf8');
    expect(ordersService).toContain('openapi.yaml');
    expect(ordersService).toContain('asyncapi.yaml');
    expect(ordersService).toContain('template.yaml');
    expect(ordersService).toContain('writesTo:\n  - id: orders-table');
    expect(ordersService).toContain('readsFrom:\n  - id: orders-table');
    const ordersTable = await readFile(path.join(root, 'containers/orders-table/index.mdx'), 'utf8');
    expect(ordersTable).toContain('container_type: database');
    expect(ordersTable).toContain('technology: Amazon DynamoDB');
    const event = await readFile(path.join(root, 'events/OrderCreated/index.mdx'), 'utf8');
    expect(event).toContain('orders-create-order');
    expect(event).toContain('notifications-order-created-consumer');
    const command = await readFile(path.join(root, 'commands/ReserveInventory/index.mdx'), 'utf8');
    expect(command).toContain('orders-create-order');
    expect(command).toContain('inventory-reserve-inventory');
    expect(await readFile(path.join(root, 'manual-marker.txt'), 'utf8')).toBe('preserve me\n');
  });

  test('is byte deterministic across two generations', async () => {
    const root = await fixture();
    await generateCatalog({ catalogRoot: root });
    const first = await snapshot(root);
    await generateCatalog({ catalogRoot: root });
    expect(await snapshot(root)).toEqual(first);
  });

  test('removes only stale paths recorded by the previous manifest', async () => {
    const root = await fixture();
    await generateCatalog({ catalogRoot: root });
    const manifestPath = path.join(root, '.eventcatalog-generated.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as { resources: string[] };
    const stale = 'queries/StaleQuery/index.mdx';
    const staleAbsolute = path.join(root, stale);
    await import('node:fs/promises').then(({ mkdir }) => mkdir(path.dirname(staleAbsolute), { recursive: true }));
    await writeFile(staleAbsolute, 'generated stale\n');
    manifest.resources.push(stale);
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await generateCatalog({ catalogRoot: root });
    await expect(readFile(staleAbsolute, 'utf8')).rejects.toThrow();
    expect(await readFile(path.join(root, 'manual-marker.txt'), 'utf8')).toBe('preserve me\n');
  });

  test('does not alter generated output when validation fails', async () => {
    const root = await fixture();
    await generateCatalog({ catalogRoot: root });
    const before = await snapshot(root);
    const file = path.join(root, 'architecture/domains/orders/openapi.yaml');
    await writeFile(file, (await readFile(file, 'utf8')).replace('x-kind: command', 'x-kind: invalid'));
    await expect(generateCatalog({ catalogRoot: root })).rejects.toThrow();
    expect(await snapshot(root)).toEqual(before);
  });
});
