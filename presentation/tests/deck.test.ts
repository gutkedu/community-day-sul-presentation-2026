import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { DECK_TITLE, SLIDE_COUNT } from '../lib/deck.ts'

const markdown = readFileSync(new URL('../slides.md', import.meta.url), 'utf8')
const source = JSON.parse(readFileSync(new URL('../docs/source-slides.json', import.meta.url), 'utf8'))

test('a sequência aprovada preserva todos os IDs e reúne as introduções aos conceitos', () => {
  const entries = [...markdown.matchAll(/^sourceId: (.+)\n(?:mergedSourceIds: (.+)\n)?index: (\d+)/gm)]
  const ids = entries.flatMap(m => [m[1].trim(), ...(m[2] ? JSON.parse(m[2]) : [])])
  assert.equal(SLIDE_COUNT, 29)
  assert.equal(entries.length, SLIDE_COUNT)
  assert.deepEqual(entries.map(m => Number(m[3])), Array.from({ length: SLIDE_COUNT }, (_, i) => i + 1))
  assert.deepEqual([...ids].sort(), source.map((s: { id: string }) => s.id).sort())
  assert.equal(new Set(ids).size, source.length)
  assert.deepEqual(entries.map(m => m[1]), [
    'p6', 'v5_about', 'v5_roadmap', 'v2s02', 'v2s04', 'slide_5',
    'p18', 'v2s08', 'v2s09', 'v2s10', 'v2s12', 'v7_http_response_event',
    'v4s14', 'slide_7', 'spec_openapi_intro', 'v2s13', 'v2s14',
    'v2s15', 'v4s21', 'v2s16', 'eventcatalog_boyne_intro', 'v2s19', 'v4s26',
    'v4s27', 'v6s30_catalog_flow',
    'ai_architecture_context', 'v2s20', 'v2s21', 'v2s22',
  ])
  assert.deepEqual(JSON.parse(entries[6][2]), ['p19', 'slide_6'])
  assert.deepEqual(JSON.parse(entries[14][2]), ['spec_asyncapi_intro'])
  assert.deepEqual(JSON.parse(entries[16][2]), ['v4s19'])
  assert.deepEqual(JSON.parse(entries[17][2]), ['v4s17'])
  assert.deepEqual(JSON.parse(entries[18][2]), ['slide_4'])
  assert.deepEqual(JSON.parse(entries[21][2]), ['v4s24', 'v4s25'])
})

test('o nome original da palestra foi preservado', () => {
  assert.equal(DECK_TITLE, 'De rotas HTTP a eventos: uma jornada prática para pensar EDA')
  assert.ok(markdown.includes(`title: "${DECK_TITLE}"`))
  assert.ok(!markdown.includes('title: Da intenção ao fato'))
})

test('OpenAPI e AsyncAPI são apresentados juntos antes dos YAMLs', () => {
  assert.ok(markdown.includes('title: "Duas especificações, dois tipos de interface"'))
  assert.ok(!markdown.includes('title: "AsyncAPI: especificação para APIs com mensagens"'))
  const scene = readFileSync(new URL('../components/SpecsOverviewScene.vue', import.meta.url), 'utf8')
  assert.ok(scene.includes('/brands/openapi.png'))
  assert.ok(scene.includes('/brands/asyncapi.png'))
  assert.ok(scene.includes('Operações HTTP'))
  assert.ok(scene.includes('Mensagens e canais'))
  assert.equal((scene.match(/class="spec-summary"/g) ?? []).length, 2)
  assert.ok(scene.includes('Tony Tam'))
  assert.ok(scene.includes('Fran Méndez'))
  assert.equal((scene.match(/class="history-item"/g) ?? []).length, 4)
})

test('a síntese reúne contratos e infraestrutura com seus ícones', () => {
  assert.ok(!markdown.includes('title: "AWS SAM: infraestrutura serverless em YAML"'))
  assert.ok(!markdown.includes('<SamInfrastructureScene'))
  assert.ok(markdown.includes('mergedSourceIds: ["slide_4"]'))
  assert.ok(markdown.includes('"icon": "/brands/openapi.png"'))
  assert.ok(markdown.includes('"icon": "/brands/asyncapi.png"'))
  assert.ok(markdown.includes('"icon": "/brands/aws-sam-introduction.png"'))
  assert.ok(markdown.includes('"iconClass": "sam"'))
  assert.ok(!markdown.includes('title: "O SAM registra os recursos do domínio"'))
  assert.ok(!markdown.includes('title: "O mesmo evento em contratos diferentes"'))
  assert.ok(!markdown.includes('title: "Agora conseguimos responder sobre Orders"'))
  assert.ok(!markdown.includes('<PublishersScene'))
  assert.ok(!markdown.includes('title: "Essas interfaces rodam sobre a AWS"'))

  const story = readFileSync(new URL('../components/StoryScene.vue', import.meta.url), 'utf8')
  assert.ok(story.includes('icon?: string'))
  assert.ok(story.includes('class="story-icon"'))
})

test('os contratos usam a extensão curta x-kind', () => {
  assert.ok(markdown.includes('x-kind: event'))
  assert.ok(!markdown.includes('x-interaction-type'))
  const contractScene = readFileSync(new URL('../components/ContractScene.vue', import.meta.url), 'utf8')
  assert.ok(contractScene.includes('x-kind: query'))
  assert.ok(contractScene.includes('x-kind: command'))
  assert.ok(contractScene.includes('x-kind: event'))
})

test('o recorte AsyncAPI explicita o EventBridge com uma extensão curta', () => {
  const contractScene = readFileSync(new URL('../components/ContractScene.vue', import.meta.url), 'utf8')
  assert.ok(contractScene.includes('address: default'))
  assert.ok(contractScene.includes('x-protocol: eventbridge'))
  assert.ok(!contractScene.includes('x-destrava-protocol'))
})

test('a síntese separa significado, mensagens e infraestrutura', () => {
  assert.ok(markdown.includes('title: "Cada arquivo responde uma parte"'))
  assert.ok(markdown.includes('index: 19\nclicks: 0\ntransition: none'))
  assert.ok(markdown.includes('Interface HTTP\\nQuery · Command'))
  assert.ok(markdown.includes('Mensagens e canais\\nCommand · Event'))
  assert.ok(markdown.includes('Infraestrutura serverless em YAML\\nLambda · EventBridge · SQS'))
  assert.ok(markdown.includes('Essas três fontes se complementam; o próximo passo foi reuni-las numa visão navegável.'))
})

test('o mapa mostra Notifications entregando e-mail pelo SES', () => {
  const awsScene = readFileSync(new URL('../components/AwsScene.vue', import.meta.url), 'utf8')
  assert.ok(awsScene.includes('Notifications Lambda'))
  assert.ok(awsScene.includes('Amazon SES'))
  assert.ok(awsScene.includes('notification-delivery'))
  assert.ok(awsScene.includes('src="/aws/ses.png"'))
  assert.ok(existsSync(resolve('public/aws/ses.png')))
  assert.ok(!awsScene.includes('class="ses-symbol"'))
})

test('o mapa mostra Inventory integrando com uma API externa de estoque', () => {
  const awsScene = readFileSync(new URL('../components/AwsScene.vue', import.meta.url), 'utf8')
  assert.ok(awsScene.includes('Inventory Lambda'))
  assert.ok(awsScene.includes('API de Estoque'))
  assert.ok(awsScene.includes('inventory-integration'))
})

test('a introdução do EventCatalog mostra o repositório público no GitHub', () => {
  assert.ok(markdown.includes('"projectImage": "/screenshots/eventcatalog-github.png"'))
  assert.ok(markdown.includes('"projectHref": "https://github.com/event-catalog/eventcatalog"'))
  assert.ok(markdown.includes('"projectLabel": "Repositório público · Open source"'))
  assert.ok(markdown.includes('"credit": "Foto: boyney.io"'))
  assert.ok(!markdown.includes('mesma imagem do Google Slides'))
  assert.ok(existsSync(resolve('public/screenshots/eventcatalog-github.png')))

  const profile = readFileSync(new URL('../components/ProfileScene.vue', import.meta.url), 'utf8')
  assert.ok(profile.includes('class="profile-project"'))
  assert.ok(profile.includes('Repositório público do EventCatalog no GitHub'))
})

test('a pipeline concentra o trabalho do gerador sem repetir outro slide', () => {
  assert.ok(markdown.includes('title: "Dos contratos ao catálogo"'))
  assert.ok(markdown.includes('mergedSourceIds: ["v4s24", "v4s25"]'))
  assert.ok(markdown.includes('A caixa sai; o CodePipeline coleta os repositórios, e os scripts Python validam e geram os recursos.'))
  assert.ok(!markdown.includes('title: "O que o gerador faz"'))

  const pipeline = readFileSync(new URL('../components/PipelineScene.vue', import.meta.url), 'utf8')
  assert.ok(pipeline.includes('<carbon-logo-git'))
  assert.ok(pipeline.includes('Coletar repositórios'))
  assert.ok(pipeline.includes('<carbon-logo-python'))
  assert.ok(pipeline.includes('Validar contratos · Gerar recursos'))
  assert.ok(pipeline.includes('<carbon-logo-npm'))
  assert.ok(pipeline.includes('@eventcatalog/core'))
  assert.ok(pipeline.includes('npm run build'))
})

test('a pipeline revela e recolhe o que extraímos antes do gerador', () => {
  const pipeline = readFileSync(new URL('../components/PipelineScene.vue', import.meta.url), 'utf8')
  assert.ok(pipeline.includes('class="pipeline-extraction"'))
  assert.ok(pipeline.includes(':class="{ visible: step === 1 }"'))
  assert.ok(pipeline.includes('Rota · operação · entrada · resposta'))
  assert.ok(pipeline.includes('Mensagem · esquema · canal · envio / recebimento'))
  assert.ok(pipeline.includes('Lambda · EventBridge · SQS · DynamoDB'))
  assert.ok(!markdown.includes('title: "O que extraímos de cada arquivo"'))
  assert.ok(!markdown.includes('title: "Como mapeamos os arquivos para o EventCatalog"'))
})

test('a publicação segura separa falha e sucesso sem substituir um catálogo válido', () => {
  const deploy = readFileSync(new URL('../components/DeployScene.vue', import.meta.url), 'utf8')
  assert.ok(markdown.includes('title: "Publicação segura do catálogo"'))
  assert.ok(deploy.includes('<carbon-logo-python'))
  assert.ok(deploy.includes('Auditoria em Python'))
  assert.ok(deploy.includes('Mantém o catálogo atual'))
  assert.ok(deploy.includes('S3 privado'))
  assert.ok(deploy.includes('CloudFront'))
  assert.ok(deploy.includes('Basic Auth'))
  assert.ok(markdown.includes('Um catálogo inválido nunca substitui a versão publicada.'))
})

test('os YAMLs dão contexto estruturado aos agentes sem substituir a validação', () => {
  assert.ok(markdown.includes('title: "Os YAMLs também são contexto para a IA"'))
  assert.ok(!markdown.includes('title: "Como a documentação ajuda no desenvolvimento com IA"'))

  const scene = readFileSync(new URL('../components/AiContextScene.vue', import.meta.url), 'utf8')
  assert.ok(scene.includes('Alterar <code>CreateOrder</code>'))
  assert.ok(scene.includes('/brands/openapi.png'))
  assert.ok(scene.includes('Operações · entradas · respostas'))
  assert.ok(scene.includes('/brands/asyncapi.png'))
  assert.ok(scene.includes('Mensagens · produtores · consumidores'))
  assert.ok(scene.includes('/brands/aws-sam-introduction.png'))
  assert.ok(scene.includes('Recursos · dependências AWS'))
  assert.ok(scene.includes('Código + contratos'))
  assert.ok(scene.includes('CI + revisão humana'))
  assert.ok(scene.includes('reduzem suposições'))
})

test('o resultado usa o painel real do catálogo fictício da palestra', () => {
  const scene = readFileSync(new URL('../components/OutcomeScene.vue', import.meta.url), 'utf8')
  assert.ok(scene.includes('/screenshots/eventcatalog-demo-dashboard.png'))
  assert.ok(scene.includes('3 domínios · 3 serviços · 5 mensagens · 1 fluxo'))
  assert.ok(scene.includes('Busca · navegação · visualização'))
  assert.ok(!scene.includes('class="related-nodes"'))
  assert.ok(existsSync(resolve('public/screenshots/eventcatalog-demo-dashboard.png')))
})

test('a recomendação final transforma especificações em documentação que evolui', () => {
  assert.ok(markdown.includes('title: "Faça a documentação evoluir com o projeto"'))
  assert.ok(markdown.includes('index: 28\nclicks: 2'))
  assert.ok(markdown.includes('<DocumentationLifecycleScene :step="$clicks" />'))

  const scene = readFileSync(new URL('../components/DocumentationLifecycleScene.vue', import.meta.url), 'utf8')
  assert.ok(scene.includes('/brands/openapi.png'))
  assert.ok(scene.includes('/brands/asyncapi.png'))
  assert.ok(scene.includes('/brands/aws-sam-introduction.png'))
  assert.ok(scene.includes('class="lifecycle-source-icon sam"'))
  assert.ok(scene.includes('Versionar e validar'))
  assert.ok(scene.includes('Gerar o EventCatalog'))
  assert.ok(scene.includes('passa a evoluir com ele'))
})

test('todos os slides têm notas e as mídias declaradas existem localmente', () => {
  assert.equal([...markdown.matchAll(/<!--\s*\n/g)].length, SLIDE_COUNT)
  const componentText = readdirSync('components').filter(f => f.endsWith('.vue')).map(f => readFileSync(resolve('components', f), 'utf8')).join('\n')
  const paths = [
    ...[...markdown.matchAll(/"(?:image|brand|projectImage)":\s*"(\/[^"\n]+)"/g)].map(m => m[1]),
    ...[...componentText.matchAll(/src="(\/[^"\n]+)"/g)].map(m => m[1]),
  ]
  assert.ok(paths.length >= 10, 'O teste deve verificar as mídias do deck, não uma lista vazia')
  for (const path of paths) {
    assert.ok(existsSync(resolve('public', path.slice(1))), path)
  }
})
