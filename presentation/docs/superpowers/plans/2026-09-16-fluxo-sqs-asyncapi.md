# Fluxo SQS e AsyncAPI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer HTTP, SQS e EventBridge contarem a mesma história do slide conceitual até a visualização no EventCatalog, simplificando o AsyncAPI e a publicação do catálogo.

**Architecture:** A apresentação continuará usando componentes Vue locais e dados no `slides.md`. Cada componente mostrará a mesma sequência — `CreateOrder`, `ReserveInventory`, `OrderCreated` — e os testes textuais impedirão divergências entre os slides. O escopo fica restrito à apresentação; o catálogo demonstrável não será regenerado nesta alteração.

**Tech Stack:** Slidev 52, Vue 3, TypeScript, CSS, Node test runner.

**Git constraint:** O checkout atual está no `main`, sem `origin/main` disponível e com alterações anteriores não commitadas. A execução deve preservar esse estado, não criar branch a partir de uma base inválida e não produzir commits misturando trabalhos.

---

## File map

- `presentation/slides.md`: títulos, contagem de cliques e notas curtas.
- `presentation/components/SemanticsScene.vue`: exemplos concretos de significado e transporte.
- `presentation/components/AwsScene.vue`: mapa AWS com os fluxos HTTP, SQS e EventBridge.
- `presentation/components/OrdersInterfacesScene.vue`: zoom nas interfaces de Orders.
- `presentation/components/ContractScene.vue`: recortes OpenAPI e AsyncAPI.
- `presentation/components/PipelineScene.vue`: fontes, geração e artefato estático.
- `presentation/components/DeployScene.vue`: publicação linear em S3 e CloudFront.
- `presentation/components/CatalogFlowScene.vue`: mapa navegável de serviços e interações.
- `presentation/styles/full-deck.css`: layout do mapa AWS, pipeline, deploy e catálogo.
- `presentation/styles/main.css`: layout dos recortes de contrato.
- `presentation/tests/deck.test.ts`: invariantes narrativas e visuais dos slides.
- `presentation/tests/orders-interfaces.test.ts`: revelação progressiva das interfaces.

### Task 1: Fixar a narrativa nos testes

**Files:**
- Modify: `presentation/tests/deck.test.ts`
- Modify: `presentation/tests/orders-interfaces.test.ts`

- [ ] **Step 1: Substituir as expectativas antigas por invariantes da nova história**

Adicionar testes que leiam os componentes e verifiquem:

```ts
test('a mesma história conecta semântica, AWS e catálogo', () => {
  for (const file of ['SemanticsScene.vue', 'AwsScene.vue', 'OrdersInterfacesScene.vue', 'CatalogFlowScene.vue']) {
    const source = readFileSync(new URL(`../components/${file}`, import.meta.url), 'utf8')
    assert.ok(source.includes('CreateOrder'))
    assert.ok(source.includes('ReserveInventory'))
    assert.ok(source.includes('OrderCreated'))
  }
})

test('o mapa AWS separa command assíncrono e event', () => {
  const source = readFileSync(new URL('../components/AwsScene.vue', import.meta.url), 'utf8')
  assert.ok(source.includes('inventory-commands'))
  assert.ok(source.includes('/transport/sqs.svg'))
  assert.ok(source.includes('/aws/eventbridge.png'))
  assert.ok(source.includes('Amazon SES'))
  assert.ok(source.includes('API de Estoque'))
})

test('o recorte AsyncAPI mostra onde e o que circula sem operações', () => {
  const source = readFileSync(new URL('../components/ContractScene.vue', import.meta.url), 'utf8')
  assert.ok(source.includes('address: inventory-commands'))
  assert.ok(source.includes('x-protocol: sqs'))
  assert.ok(source.includes('ReserveInventory'))
  assert.ok(source.includes('x-kind: command'))
  assert.ok(source.includes('address: default'))
  assert.ok(source.includes('x-protocol: eventbridge'))
  assert.ok(source.includes('OrderCreated'))
  assert.ok(!source.includes("['    action: send'"))
  assert.ok(!source.includes('class="direction-pair"'))
})

test('a publicação segue linearmente até o usuário', () => {
  const source = readFileSync(new URL('../components/DeployScene.vue', import.meta.url), 'utf8')
  assert.ok(source.includes('dist/'))
  assert.ok(source.includes('S3'))
  assert.ok(source.includes('CloudFront'))
  assert.ok(source.includes('Usuário'))
  assert.ok(!source.includes('Auditoria em Python'))
  assert.ok(!source.includes('PASSOU?'))
})
```

Remover as expectativas de árvore de decisão, auditoria em Python, `send`/`receive` visíveis e captura raster de alta resolução.

- [ ] **Step 2: Executar a suíte e confirmar RED**

Run: `cd presentation && npm test`

Expected: FAIL nos testes novos porque os componentes ainda representam a narrativa antiga.

### Task 2: Tornar o slide 11 concreto

**Files:**
- Modify: `presentation/components/SemanticsScene.vue`
- Modify: `presentation/slides.md:218-235`

- [ ] **Step 1: Trocar os dois eixos abstratos por três exemplos progressivos**

Usar estes dados no componente:

```ts
const interactions = [
  { name: 'CreateOrder', meaning: 'Command', intent: 'Solicitar a criação', mechanism: 'API Gateway', icon: '/aws/api-gateway.png', tone: 'command' },
  { name: 'ReserveInventory', meaning: 'Command', intent: 'Solicitar a reserva', mechanism: 'SQS', icon: '/transport/sqs.svg', tone: 'command' },
  { name: 'OrderCreated', meaning: 'Event', intent: 'Comunicar o pedido criado', mechanism: 'EventBridge', icon: '/aws/eventbridge.png', tone: 'event' },
]
```

Cada clique revela uma linha com três blocos: interação, significado e mecanismo. Mostrar a conclusão `Dois Commands. Transportes diferentes.` somente no terceiro clique.

- [ ] **Step 2: Atualizar as notas do slide 11**

Manter `clicks: 3` e usar notas:

```md
- [click] CreateOrder: Command via API Gateway.
- [click] ReserveInventory: também é Command, agora via SQS.
- [click] OrderCreated: Event distribuído pelo EventBridge.
- Mesmo significado pode usar transportes diferentes.
- Transição: quem publica e quem reage têm responsabilidades diferentes.
```

- [ ] **Step 3: Executar os testes**

Run: `cd presentation && npm test`

Expected: os testes do slide 11 passam; os demais testes novos continuam falhando.

### Task 3: Atualizar o sistema AWS e as interfaces de Orders

**Files:**
- Modify: `presentation/components/AwsScene.vue`
- Modify: `presentation/components/OrdersInterfacesScene.vue`
- Modify: `presentation/slides.md:254-302`
- Modify: `presentation/styles/full-deck.css:133-149`

- [ ] **Step 1: Redesenhar o mapa AWS**

Representar quatro revelações:

```text
1. Cliente → API Gateway → Orders Lambda        CreateOrder
2. Orders Lambda → DynamoDB                     persistência
3. Orders Lambda → SQS → Inventory → API        ReserveInventory
4. Orders Lambda → EventBridge → Notifications → SES  OrderCreated
```

Adicionar um recurso SQS com `src="/transport/sqs.svg"`, título `SQS` e legenda `inventory-commands`. EventBridge deve deixar de apontar para Inventory. Usar fios distintos `aws-command-async` e `aws-event`.

- [ ] **Step 2: Habilitar os quatro cliques no slide 13**

Alterar `clicks: 0` para `clicks: 4`, passar `:step="$clicks"` e atualizar as notas para a sequência anterior.

- [ ] **Step 3: Mostrar duas categorias e três interações no slide 14**

No primeiro clique, manter `GetOrderById` e `CreateOrder`. No segundo, revelar duas linhas:

```text
ReserveInventory — COMMAND — SQS → Inventory
OrderCreated — EVENT — EventBridge → Notifications
```

Alterar o título para `Orders expõe operações e mensagens` e manter dois cliques.

- [ ] **Step 4: Executar os testes**

Run: `cd presentation && npm test`

Expected: passam as invariantes de semântica, AWS e interfaces; AsyncAPI, deploy e catálogo ainda falham.

### Task 4: Simplificar o recorte AsyncAPI

**Files:**
- Modify: `presentation/components/ContractScene.vue`
- Modify: `presentation/slides.md:339-359`
- Modify: `presentation/styles/main.css:27`

- [ ] **Step 1: Substituir o recorte AsyncAPI por dois canais e duas mensagens**

Usar exatamente estas linhas no array `aas`:

```ts
const aas = [
  ['channels:', 0],
  ['  inventoryCommands:', 0],
  ['    address: inventory-commands', 1],
  ['    x-protocol: sqs', 1],
  ['    messages:', 0],
  ['      ReserveInventory:', 2],
  ['        name: inventory.reserve.v1', 2],
  ['        x-kind: command', 2],
  ['  orderEvents:', 0],
  ['    address: default', 1],
  ['    x-protocol: eventbridge', 1],
  ['    messages:', 0],
  ['      OrderCreated:', 2],
  ['        name: order.created.v1', 2],
  ['        x-kind: event', 2],
] as const
```

No clique 1, explicar `Onde circula?`; no clique 2, `O que circula?`. Substituir o par direcional por duas pílulas: `ReserveInventory / COMMAND` e `OrderCreated / EVENT`.

- [ ] **Step 2: Atualizar título, cliques e notas**

Usar título `Command e Event no AsyncAPI`, `clicks: 2` e notas:

```md
- Recorte didático do contrato; as operações continuam no arquivo completo.
- [click] Onde circula: address e x-protocol distinguem SQS e EventBridge.
- [click] O que circula: mensagem, nome versionado e x-kind.
- x-protocol e x-kind são extensões do projeto.
- Transição: nomes consistentes ligam as fontes.
```

- [ ] **Step 3: Executar os testes**

Run: `cd presentation && npm test`

Expected: passam os testes do contrato AsyncAPI; deploy e catálogo ainda falham.

### Task 5: Simplificar geração e publicação

**Files:**
- Modify: `presentation/components/PipelineScene.vue`
- Modify: `presentation/components/DeployScene.vue`
- Modify: `presentation/slides.md:439-481`
- Modify: `presentation/styles/full-deck.css:151-178`

- [ ] **Step 1: Reduzir o papel do Python no gerador**

No bloco central da pipeline, manter Git e um bloco único `Gerador` com o texto `Lê os YAMLs · cria os recursos`. O ícone Python pode permanecer pequeno, mas remover `Validar contratos` da mensagem principal.

- [ ] **Step 2: Transformar o deploy em uma linha reta**

O componente `DeployScene.vue` deve renderizar estes quatro estágios:

```text
dist/ → S3 privado → CloudFront → Usuário
```

Usar três cliques: `dist/`, depois S3, depois CloudFront e usuário. Remover completamente auditoria, losango, ramificações e resultado de falha.

- [ ] **Step 3: Atualizar o slide 23**

Alterar o título para `Do build ao catálogo publicado` e as notas:

```md
- O EventCatalog gera um site estático em dist/.
- [click] O artefato está pronto para publicação.
- [click] O S3 hospeda os arquivos estáticos.
- [click] O CloudFront entrega o catálogo para o time.
- Transição: agora podemos navegar pelas relações documentadas.
```

- [ ] **Step 4: Executar os testes**

Run: `cd presentation && npm test`

Expected: passam os testes de pipeline e publicação; o catálogo ainda falha.

### Task 6: Substituir a árvore por um mapa de serviços no slide 24

**Files:**
- Modify: `presentation/components/CatalogFlowScene.vue`
- Modify: `presentation/slides.md:483-502`
- Modify: `presentation/styles/full-deck.css:186-188`
- Modify: `presentation/tests/deck.test.ts`

- [ ] **Step 1: Trocar a captura raster por um mapa nativo**

Renderizar quatro serviços e três relações dentro da moldura do EventCatalog:

```text
Cliente ── CreateOrder / HTTP ──▶ Orders
Orders ── ReserveInventory / SQS ──▶ Inventory
Orders ── OrderCreated / EventBridge ──▶ Notifications
```

Estado inicial: serviços. Clique 1: Commands (`CreateOrder` e `ReserveInventory`). Clique 2: Event (`OrderCreated`). Usar as cores de Command e Event já existentes no deck.

- [ ] **Step 2: Atualizar título e notas do slide 24**

Alterar o título para `As relações ficam navegáveis` e usar:

```md
- O catálogo reorganiza contratos dispersos como relações entre serviços.
- [click] Commands: CreateOrder chega a Orders; ReserveInventory segue para Inventory.
- [click] Event: OrderCreated é publicado por Orders e consumido por Notifications.
- Transição: cada relação também leva aos detalhes e ao schema.
```

- [ ] **Step 3: Ajustar o teste para o mapa nativo**

Verificar que `CatalogFlowScene.vue` contém os quatro atores e três interações e não contém `/catalog/create-order-flow.png`.

- [ ] **Step 4: Executar os testes**

Run: `cd presentation && npm test`

Expected: PASS em toda a suíte.

### Task 7: Verificação final e inspeção visual

**Files:**
- Verify: `presentation/slides.md`
- Verify: `presentation/components/*.vue`
- Verify: `presentation/styles/*.css`

- [ ] **Step 1: Executar verificações automatizadas**

Run:

```bash
cd presentation
npm test
npm run build
```

Expected: todos os testes passam e o Slidev conclui o build sem erros.

- [ ] **Step 2: Verificar whitespace e escopo**

Run:

```bash
rtk git diff --check
rtk git diff --name-status
```

Expected: nenhum erro de whitespace; apenas arquivos da apresentação e os documentos de design/plano aparecem como alterações novas desta etapa.

- [ ] **Step 3: Inspecionar visualmente todos os estados**

No Slidev local, verificar slides 11, 13, 14, 17, 22, 23 e 24 em todos os cliques. Confirmar:

- nenhuma seta cruza cards;
- nenhum texto ultrapassa limites;
- SQS e EventBridge são visualmente distintos;
- o YAML permanece legível;
- a publicação é uma linha reta;
- o mapa do catálogo não parece uma árvore de decisão.

- [ ] **Step 4: Relatar o estado sem criar commit**

Informar testes, build, arquivos alterados e riscos residuais. Não fazer commit até existir uma base/branch válida ou autorização explícita para consolidar o trabalho atual.
