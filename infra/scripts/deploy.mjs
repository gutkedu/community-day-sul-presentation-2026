import { accessSync, constants } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { isDeepStrictEqual } from 'node:util'
import { publishSite } from './publish.mjs'

const infra = fileURLToPath(new URL('..', import.meta.url))
const root = path.dirname(infra)
const targets = ['infra', 'presentation', 'event-catalog', 'all']
const outputPrefixes = { presentation: 'Presentation', 'event-catalog': 'EventCatalog' }

function options(argv) {
  const [target, ...args] = argv
  if (!targets.includes(target)) throw new Error('Destino inválido: infra, presentation, event-catalog ou all.')
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Uso: deploy-${target}.sh --region REGIAO [--profile PERFIL] [--stack-name NOME]

Stack padrão: community-day-sul-presentation-2026
--region é obrigatório; --profile usa a cadeia padrão da AWS CLI quando omitido.
--stack-name aceita até 40 caracteres, para os nomes de recursos CloudFront.
Os scripts individuais publicam em uma stack existente. Use deploy-all.sh na primeira publicação.
deploy-infra.sh e deploy-all.sh pedem confirmação do change set no SAM.
Pré-requisitos: Node.js >=22.18, npm e AWS CLI v2; SAM CLI para infra/all.
Os projetos e a infraestrutura têm suas dependências instaladas via npm ci.`)
    return null
  }
  const config = { target, 'stack-name': 'community-day-sul-presentation-2026' }
  const seen = new Set()
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '')
    const value = args[i + 1]
    if (!['--region', '--profile', '--stack-name'].includes(args[i]) || !value || value.startsWith('--') || seen.has(key)) {
      throw new Error(`Argumento inválido ou sem valor: ${args[i]}. Consulte --help.`)
    }
    seen.add(key)
    config[key] = value
  }
  if (!config.region || !/^[a-z]{2}(?:-[a-z]+)+-\d+$/.test(config.region)) throw new Error('Informe uma região AWS válida com --region.')
  if (!/^[a-zA-Z][a-zA-Z0-9-]{0,39}$/.test(config['stack-name'])) throw new Error('--stack-name deve começar com letra e conter até 40 letras, números ou hífens.')
  return config
}

function requireCommand(command) {
  const found = (process.env.PATH || '').split(path.delimiter).some(directory => {
    try { accessSync(path.join(directory, command), constants.X_OK); return true } catch { return false }
  })
  if (!found) throw new Error(`Pré-requisito ausente: ${command}. Consulte infra/README.md.`)
}

function run(stage, command, args, { cwd = root, capture = false, env = {} } = {}) {
  console.log(`→ ${stage}`)
  const result = spawnSync(command, args, {
    cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
    stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit',
    env: { ...process.env, AWS_PAGER: '', SAM_CLI_TELEMETRY: '0', ...env },
  })
  if (result.error || result.status !== 0) {
    throw new Error(`Falha em ${stage} (${result.error?.message || result.signal || `código ${result.status}`}).`)
  }
  return result.stdout
}

function parseJson(text, stage) {
  try { return JSON.parse(text) } catch { throw new Error(`Resposta JSON inválida em ${stage}.`) }
}

function destinations(response) {
  const stack = response.Stacks?.[0]
  if (!stack || !['CREATE_COMPLETE', 'UPDATE_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE', 'IMPORT_COMPLETE', 'IMPORT_ROLLBACK_COMPLETE'].includes(stack.StackStatus)) {
    throw new Error('A stack não está em um estado estável para publicação.')
  }
  const values = Object.fromEntries((stack.Outputs || []).map(item => [item.OutputKey, item.OutputValue]))
  const result = {}
  for (const [site, prefix] of Object.entries(outputPrefixes)) {
    const bucket = values[`${prefix}BucketName`]
    const distribution = values[`${prefix}DistributionId`]
    const url = values[`${prefix}Url`]
    if (typeof bucket !== 'string' || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)
      || typeof distribution !== 'string' || !/^[A-Z0-9]+$/.test(distribution)
      || typeof url !== 'string' || !/^https:\/\/d[a-z0-9]+\.cloudfront\.net\/?$/.test(url)) {
      throw new Error(`Outputs ausentes ou inválidos para ${site}; nenhum conteúdo será enviado.`)
    }
    result[site] = { bucket, distribution, url }
  }
  if (result.presentation.bucket === result['event-catalog'].bucket
    || result.presentation.distribution === result['event-catalog'].distribution) {
    throw new Error('A stack deve fornecer buckets e distribuições diferentes para cada frontend.')
  }
  return result
}

async function main() {
  const config = options(process.argv.slice(2))
  if (!config) return
  const [major, minor] = process.versions.node.split('.').map(Number)
  if (major < 22 || (major === 22 && minor < 18)) throw new Error('Node.js 22.18 ou posterior é obrigatório.')
  const includesInfra = ['infra', 'all'].includes(config.target)
  for (const command of ['npm', 'aws', ...(includesInfra ? ['sam'] : [])]) requireCommand(command)
  const awsOptions = ['--region', config.region, ...(config.profile ? ['--profile', config.profile] : [])]
  const runAws = (stage, args, extra = {}) => run(stage, 'aws', [...args, ...awsOptions], extra)
  const jsonAws = (stage, args) => parseJson(runAws(stage, [...args, '--output', 'json'], { capture: true }), stage)

  console.log(`Destino: ${config.target}; stack: ${config['stack-name']}; região: ${config.region}`)
  run('instalar ferramentas locais', 'npm', ['ci', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: infra })
  run('testar infraestrutura e scripts', 'npm', ['test'], { cwd: infra })
  // Loaded after npm ci so --help and a fresh checkout work without node_modules.
  const { checkBuild } = await import('./check-builds.mjs')
  const selected = config.target === 'all' ? Object.keys(outputPrefixes) : config.target === 'infra' ? [] : [config.target]
  const builds = {}
  for (const site of selected) {
    const cwd = path.join(root, site)
    run(`instalar ${site}`, 'npm', ['ci', '--include=dev', '--no-audit', '--no-fund'], { cwd, env: { PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' } })
    run(`testar ${site}`, 'npm', ['test'], { cwd })
    if (site === 'event-catalog') {
      run('gerar catálogo dos contratos', 'npm', ['run', 'generate'], { cwd })
      run('validar catálogo', 'npm', ['run', 'lint'], { cwd })
    }
    run(`build ${site}`, 'npm', ['run', 'build'], { cwd })
    builds[site] = await checkBuild(site)
  }
  if (includesInfra) {
    run('validar template SAM', 'sam', ['validate', '--lint', '--template-file', path.join(infra, 'template.yaml'), ...awsOptions])
  }
  const identity = jsonAws('verificar identidade AWS', ['sts', 'get-caller-identity'])
  if (!/^\d{12}$/.test(identity.Account)) throw new Error('Conta AWS inválida na resposta de identidade.')
  console.log(`Conta AWS: ${identity.Account}`)
  if (includesInfra) {
    run('implantar stack SAM', 'sam', [
      'deploy', '--template-file', path.join(infra, 'template.yaml'), '--stack-name', config['stack-name'],
      '--confirm-changeset', '--no-fail-on-empty-changeset', ...awsOptions,
    ])
  }
  let stack
  try {
    stack = jsonAws('ler outputs da stack', ['cloudformation', 'describe-stacks', '--stack-name', config['stack-name']])
  } catch (error) {
    throw new Error(`${error.message} Verifique conta, perfil, região e stack; para criá-la, use deploy-infra.sh ou deploy-all.sh.`)
  }
  const outputs = destinations(stack)
  // SAM can return status 0 when the user declines its change-set prompt.
  // Verify the stored original template rather than parsing human-facing output.
  const { parse } = await import('yaml')
  const localTemplate = parse(await readFile(path.join(infra, 'template.yaml'), 'utf8'))
  const remote = jsonAws('conferir template implantado', [
    'cloudformation', 'get-template', '--stack-name', config['stack-name'], '--template-stage', 'Original',
  ]).TemplateBody
  const remoteTemplate = typeof remote === 'string' ? parse(remote) : remote
  // SAM adds resource identity metadata while packaging the original template.
  // Ignore only that exact generated marker, never other metadata or properties.
  for (const [logicalId, resource] of Object.entries(remoteTemplate?.Resources || {})) {
    if (resource.Metadata?.SamResourceId === logicalId
      && !Object.hasOwn(localTemplate.Resources?.[logicalId]?.Metadata || {}, 'SamResourceId')) {
      delete resource.Metadata.SamResourceId
      if (Object.keys(resource.Metadata).length === 0) delete resource.Metadata
    }
  }
  if (!isDeepStrictEqual(localTemplate, remoteTemplate)) {
    throw new Error('O template implantado difere do local (implantação cancelada ou infraestrutura desatualizada). Execute deploy-infra.sh; nenhum conteúdo foi enviado.')
  }
  for (const site of selected) await publishSite({ site, build: builds[site], destination: outputs[site], runAws, jsonAws })
  if (!selected.length) {
    console.log(`Infraestrutura pronta. Publique os builds para disponibilizar o conteúdo:\n${outputs.presentation.url}\n${outputs['event-catalog'].url}`)
  }
}

try { await main() } catch (error) {
  console.error(`Erro: ${error.message}`)
  process.exitCode = 1
}
