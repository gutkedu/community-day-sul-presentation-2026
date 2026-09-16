import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'

test('only fingerprinted compiler JS/CSS get immutable caching; HTML and data must revalidate', async () => {
  const moduleUrl = new URL('../scripts/publish.mjs', import.meta.url)
  assert.ok(existsSync(moduleUrl), 'publication helper must exist')
  const { classifyArtifact } = await import(moduleUrl.href)
  for (const file of ['assets/deck-Abcd1234.js', 'assets/deck-Abcd1234.css', '_astro/page.Abcd1234.js']) {
    assert.equal(classifyArtifact(file), 'immutable', file)
  }
  for (const file of ['logo.png', 'api/sidebar-data.json', 'llms.txt', 'generated/example.json',
    'assets/no-hash.js', 'assets/example-Abcd1234.json', 'public/file-Abcd1234.js']) {
    assert.equal(classifyArtifact(file), 'mutable', file)
  }
  for (const file of ['index.html', 'docs/events/OrderCreated/1.0.0/index.html']) {
    assert.equal(classifyArtifact(file), 'html', file)
  }
})
