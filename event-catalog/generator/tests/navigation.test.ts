import { expect, test } from 'vitest';
const { default: config }: {
  default: { navigation: { groups: Array<{ items: Array<{ id: string }> }> } };
} = await import(new URL('../../eventcatalog.config.js', import.meta.url).href);

test('exposes the native global domain map without dropping built-in navigation', () => {
  const items = (config.navigation.groups ?? []).flatMap(group => group.items);
  expect(items).toContainEqual(expect.objectContaining({
    id: 'domain-map', label: 'Mapa dos domínios', href: '/visualiser/domain-integrations', icon: 'Network',
  }));
  expect(items.map(item => item.id)).toEqual(expect.arrayContaining([
    'home', 'docs', 'catalog', 'schemas', 'schema-insights', 'teams', 'users', 'settings',
  ]));
});
