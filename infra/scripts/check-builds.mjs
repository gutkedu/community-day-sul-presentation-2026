import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { parse } from 'yaml'

export const projectRoot = fileURLToPath(new URL('../..', import.meta.url))
export const sites = { presentation: 'Presentation', 'event-catalog': 'EventCatalog' }

export async function listFiles(directory) {
  const result = []
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name)
      if (entry.isDirectory()) await visit(absolute)
      else if (entry.isFile()) result.push(path.relative(directory, absolute).split(path.sep).join('/'))
      else throw new Error(`Build contém um arquivo especial ou link simbólico: ${absolute}`)
    }
  }
  await visit(directory)
  return result.sort()
}

export async function checkBuild(site) {
  if (!Object.hasOwn(sites, site)) throw new Error(`Projeto inválido: ${site}`)
  const dist = path.join(projectRoot, site, 'dist')
  const files = await listFiles(dist)
  if (!files.includes('index.html') || !(await readFile(path.join(dist, 'index.html'), 'utf8')).trim()) {
    throw new Error(`${site}: build sem index.html válido`)
  }
  const template = parse(await readFile(new URL('../template.yaml', import.meta.url), 'utf8'))
  const code = template.Resources[`${sites[site]}RoutingFunction`].Properties.FunctionCode
  const context = vm.createContext({})
  new vm.Script(code).runInContext(context, { timeout: 1000 })
  const invocation = new vm.Script('handler(event).uri')
  function rewrite(uri) {
    context.event = { request: { uri, method: 'GET', headers: {}, cookies: {}, querystring: {} } }
    return invocation.runInContext(context, { timeout: 1000 })
  }
  let pageCount = 0
  for (const file of files) {
    const uri = `/${file}`
    if (rewrite(uri) !== uri) throw new Error(`${site}: download reescrito incorretamente: ${uri}`)
    if (file === 'index.html' || file.endsWith('/index.html')) {
      const route = uri.slice(0, -'index.html'.length)
      for (const variant of [route, route.slice(0, -1) || '/']) {
        if (rewrite(variant) !== uri) throw new Error(`${site}: rota ${variant} não resolve para ${uri}`)
      }
      pageCount++
    }
  }
  if (site === 'presentation') {
    for (const route of ['/1', '/presenter/1', '/overview']) {
      if (rewrite(route) !== '/index.html') throw new Error(`Rota do Slidev inválida: ${route}`)
    }
  }
  console.log(`${site}: ${pageCount} páginas e ${files.length} arquivos verificados contra o roteamento CloudFront.`)
  return { dist, files }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    for (const site of process.argv.length > 2 ? process.argv.slice(2) : Object.keys(sites)) await checkBuild(site)
  } catch (error) {
    console.error(`Erro na validação do build: ${error.message}`)
    process.exitCode = 1
  }
}
