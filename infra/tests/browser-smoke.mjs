import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { chromium } from '../../presentation/node_modules/playwright-chromium/index.mjs'
import jsQR from '../../presentation/node_modules/jsqr/dist/jsQR.js'
import pngjs from '../../presentation/node_modules/pngjs/lib/png.js'

const root = fileURLToPath(new URL('../..', import.meta.url))
const template = parse(await readFile(new URL('../template.yaml', import.meta.url), 'utf8'))
const links = JSON.parse(await readFile(new URL('../../presentation/lib/published-links.json', import.meta.url), 'utf8'))
const remote = { presentation: process.argv[2], 'event-catalog': process.argv[3] }
const screenshots = path.join(root, 'presentation', 'artifacts')
await mkdir(screenshots, { recursive: true })
const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.yaml': 'text/yaml', '.txt': 'text/plain',
}
const cases = [
  ['presentation', 'Presentation', [
    ['/1', 'De rotas HTTP'], ['/presenter/1', 'Jornada:'], ['/18', 'Cada arquivo'],
    ['/19', 'Como apliquei isso'], ['/29', 'Obrigado!'],
  ]],
  ['event-catalog', 'EventCatalog', [
    ['/docs/events/OrderCreated/1.0.0', 'Order'],
    ['/visualiser/events/OrderCreated/1.0.0', 'Order'],
    ['/docs/commands/CreateOrder/1.0.0/examples/example.json', 'Example for Create Order'],
    ['/docs/services/inventory-stock-api/1.0.0', 'API de Estoque'],
    ['/visualiser/services/inventory-reserve-inventory/1.0.0', 'API de Estoque'],
    ['/visualiser/domain-integrations', 'Inventory'],
    ['/visualiser/flows/CreateOrderFlow/1.0.0', 'API de Estoque'],
  ]],
]
const browser = await chromium.launch({ headless: true })
try {
  for (const [site, resource, routes] of cases) {
    const context = vm.createContext({})
    vm.runInContext(template.Resources[`${resource}RoutingFunction`].Properties.FunctionCode, context)
    const dist = path.join(root, site, 'dist')
    const server = createServer(async (request, response) => {
      try {
        context.event = { request: { uri: decodeURIComponent(new URL(request.url, 'http://localhost').pathname), method: 'GET', headers: {}, querystring: {} } }
        const uri = vm.runInContext('handler(event).uri', context)
        const file = path.resolve(dist, `.${uri}`)
        if (!file.startsWith(`${dist}${path.sep}`) || !(await stat(file)).isFile()) throw new Error('Not a file')
        response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' })
        response.end(await readFile(file))
      } catch {
        response.writeHead(404)
        response.end('Not found')
      }
    })
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const base = (remote[site] || `http://127.0.0.1:${server.address().port}`).replace(/\/$/, '')
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    // Headless browsers cannot keep a display awake. Only this isolated browser
    // preference changes; production assets and the user's browser stay intact.
    await page.addInitScript(() => localStorage.setItem('slidev-wake-lock', 'false'))
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      for (const [route, text] of routes) {
        assert.equal((await page.goto(base + route, { waitUntil: 'networkidle' })).status(), 200)
        await page.waitForFunction(expected => document.body.innerText.includes(expected), text, { timeout: 10000 })
        assert.equal((await page.reload({ waitUntil: 'networkidle' })).status(), 200)
        await page.waitForFunction(expected => document.body.innerText.includes(expected), text, { timeout: 10000 })
        console.log(`${site}: ${route} abriu e recarregou.`)
      }
      const missingStatus = (await fetch(`${base}/absent-file.js`)).status
      assert.ok(missingStatus >= 400 && missingStatus < 500)
      if (site === 'presentation') {
        const images = page.locator('.final-closing:visible .closing-qr')
        assert.equal(await images.count(), 2)
        for (const [index, link] of links.entries()) {
          const image = images.nth(index)
          await image.evaluate(async element => { await element.decode() })
          const png = pngjs.PNG.sync.read(await image.screenshot())
          assert.ok(png.width >= 200 && png.height >= 200, 'QR code pequeno demais')
          assert.ok(png.width <= 220 && png.height <= 220, 'QR code deve ser cerca de 25% menor que a versão original')
          const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
          assert.equal(decoded?.data, link.url)
          assert.equal(await image.locator('..').getAttribute('href'), link.url)
          console.log(`QR decodificado da imagem do slide: ${decoded.data}`)
        }
        const bounds = await page.locator('.final-closing:visible').boundingBox()
        const cardBounds = []
        for (const card of await page.locator('.final-closing:visible .closing-link-card').all()) {
          const box = await card.boundingBox()
          cardBounds.push(box)
          assert.ok(box.x >= bounds.x && box.y >= bounds.y && box.x + box.width <= bounds.x + bounds.width + 1 && box.y + box.height <= bounds.y + bounds.height - 40)
          assert.ok(await card.locator('.closing-url').evaluate(link => link.scrollWidth <= link.clientWidth), 'URL deve caber no cartão')
        }
        assert.ok(cardBounds[1].x - cardBounds[0].x - cardBounds[0].width >= 100, 'Cartões devem ficar mais afastados')
        await page.screenshot({ path: path.join(screenshots, 'closing-qrcodes.png') })
      }
      if (site === 'event-catalog') {
        const schema = await (await fetch(`${base}/generated/events/OrderCreated/schema.json`)).json()
        assert.ok(schema.properties)
        assert.equal((await fetch(`${base}/generated/services/orders-create-order/openapi.yaml`)).status, 200)
        const externalSpec = await fetch(`${base}/generated/services/inventory-stock-api/openapi.yaml`)
        assert.equal(externalSpec.status, 200)
        assert.ok((await externalSpec.text()).includes('operationId: ReserveStock'))
        const menu = page.getByRole('link', { name: 'Mapa dos domínios', exact: true })
        assert.ok(await menu.count() >= 1)
        assert.equal(await menu.first().getAttribute('href'), '/visualiser/domain-integrations')
        await menu.first().click()
        await page.waitForURL('**/visualiser/domain-integrations')
        await page.waitForLoadState('networkidle')
        await page.waitForFunction(() => {
          const labels = [...document.querySelectorAll('.react-flow__node')].map(node => node.textContent).join(' ')
          return ['Orders', 'Inventory', 'Notifications'].every(name => labels.includes(name))
        })
        await page.locator('.react-flow__node').first().waitFor()
        const nodes = (await page.locator('.react-flow__node').allTextContents()).join('\n')
        for (const name of ['Orders', 'Inventory', 'Notifications']) assert.ok(nodes.includes(name), name)
        assert.ok(await page.locator('.react-flow__edge').count() >= 4)
        await page.screenshot({ path: path.join(screenshots, 'domain-map.png'), animations: 'disabled' })
      }
      assert.deepEqual(errors, [])
      console.log(`${site}: sem erros JavaScript; assets inexistentes retornam 4xx.`)
    } finally {
      await page.close()
      await new Promise(resolve => server.close(resolve))
    }
  }
} finally {
  await browser.close()
}
