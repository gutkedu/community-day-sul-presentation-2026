import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { chromium } from '../../presentation/node_modules/playwright-chromium/index.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))
const template = parse(await readFile(new URL('../template.yaml', import.meta.url), 'utf8'))
const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.yaml': 'text/yaml', '.txt': 'text/plain',
}
const cases = [
  ['presentation', 'Presentation', [['/1', 'De rotas HTTP'], ['/presenter/1', 'Jornada:'], ['/19', 'Cada arquivo']]],
  ['event-catalog', 'EventCatalog', [
    ['/docs/events/OrderCreated/1.0.0', 'Order'],
    ['/visualiser/events/OrderCreated/1.0.0', 'Order'],
    ['/docs/commands/CreateOrder/1.0.0/examples/example.json', 'Example for Create Order'],
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
    const base = `http://127.0.0.1:${server.address().port}`
    const page = await browser.newPage()
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
        console.log(`${site}: ${route} abriu e recarregou.`)
      }
      assert.equal((await fetch(`${base}/absent-file.js`)).status, 404)
      if (site === 'event-catalog') {
        const schema = await (await fetch(`${base}/generated/events/OrderCreated/schema.json`)).json()
        assert.ok(schema.properties)
        assert.equal((await fetch(`${base}/generated/services/orders-service/openapi.yaml`)).status, 200)
      }
      assert.deepEqual(errors, [])
      console.log(`${site}: sem erros JavaScript; assets inexistentes retornam 404.`)
    } finally {
      await page.close()
      await new Promise(resolve => server.close(resolve))
    }
  }
} finally {
  await browser.close()
}
