import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import QRCode from 'qrcode'

test('os QR codes locais apontam para o GitHub do projeto e o EventCatalog', async () => {
  const file = new URL('../lib/published-links.json', import.meta.url)
  assert.ok(existsSync(file), 'Falta a configuração dos links publicados')
  const links = JSON.parse(readFileSync(file, 'utf8'))
  assert.deepEqual(links.map(link => link.url), [
    'https://github.com/gutkedu/community-day-sul-presentation-2026',
    'https://d1ebg5f5z5lxgr.cloudfront.net/',
  ])
  assert.deepEqual(links.map(link => [link.id, link.label]), [
    ['github', 'GitHub'],
    ['event-catalog', 'EventCatalog'],
  ])
  for (const link of links) {
    const svgFile = new URL(`../public/qrcodes/${link.id}.svg`, import.meta.url)
    assert.ok(existsSync(svgFile), `Falta QR code para ${link.id}`)
    const expected = await QRCode.toString(link.url, { type: 'svg', margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000ff', light: '#ffffffff' } })
    assert.equal(readFileSync(svgFile, 'utf8'), expected)
  }
})
