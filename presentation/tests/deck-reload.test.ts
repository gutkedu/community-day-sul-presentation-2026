import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { deckReload } from '../scripts/deck-reload.mjs'

test('mudar cliques recarrega as abas; editar apenas notas mantém o editor', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'deck-reload-'))
  try {
    const file = join(directory, 'slides.md')
    let content = '---\nclicks: 3\n---\n# Query\n<!-- fala antiga -->'
    writeFileSync(file, content)
    const plugin = deckReload(file)
    const events: unknown[] = []
    const context = { file, read: async () => content, server: { moduleGraph: { invalidateAll: () => events.push('invalidated') }, ws: { send: (event: unknown) => events.push(event) } } }
    content = content.replace('fala antiga', 'fala revisada')
    assert.equal(await plugin.handleHotUpdate.handler(context), undefined)
    assert.deepEqual(events, [])
    content = content.replace('clicks: 3', 'clicks: 2')
    assert.deepEqual(await plugin.handleHotUpdate.handler(context), [])
    assert.deepEqual(events, ['invalidated', { type: 'full-reload' }])
    events.length = 0
    await plugin.handleHotUpdate.handler(context)
    assert.deepEqual(events, [])
  } finally { rmSync(directory, { recursive: true }) }
})
