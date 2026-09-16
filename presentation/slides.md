---
theme: default
author: Eduardo Pedó Gutkoski
info: Apresentação com 35 slides e fluxos conceituais animados.
lang: pt-BR
canvasWidth: 1280
aspectRatio: 16/9
colorSchema: dark
fonts:
  provider: none
  sans: Inter
  mono: Roboto Mono
drawings:
  enabled: false
transition: fade
mdc: true
download: false
selectable: true
defaults:
  layout: default
title: "De rotas HTTP a eventos: uma jornada prática para pensar EDA"
sourceId: p6
index: 1
clicks: 0
eyebrow: ""
scene: {}
---

<CoverScene />

<!--
- Jornada: rotas HTTP → intenções e fatos → contratos → catálogo.
- Transição: apresentação rápida.
-->

---
title: "Sobre mim"
sourceId: v5_about
index: 2
clicks: 0
eyebrow: "SOBRE MIM"
scene: {"name": "Eduardo Pedó Gutkoski", "role": "Engenheiro de Software · Destrava Aí", "roleDetail": "Backend e serverless na AWS", "body": "AWS User Group Leader · Florianópolis", "image": "/people/eduardo.png", "href": "https://www.linkedin.com/in/eduardogutkoski/", "linkLabel": "linkedin.com/in/eduardogutkoski"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ProfileScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Backend e serverless na AWS.
- AWS User Group de Florianópolis.
- Transição: agenda da palestra.
-->

---
title: "Agenda"
sourceId: v5_roadmap
index: 3
clicks: 0
eyebrow: ""
scene: {"layout": "rows", "items": [{"label": "01 / ENTENDER", "title": "O significado das interações", "body": "Do desafio no sistema a Query, Command e Event", "tone": "neutral"}, {"label": "02 / DOCUMENTAR", "title": "Operações, mensagens e responsabilidades", "body": "Um exemplo com OpenAPI, AsyncAPI e AWS", "tone": "neutral"}, {"label": "03 / NAVEGAR", "title": "Dos contratos ao EventCatalog", "body": "Como usamos esse conhecimento no trabalho", "tone": "neutral"}]}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <StoryScene :step="$clicks" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- 1. Entender o significado das interações.
- 2. Documentar operações, mensagens e responsabilidades.
- 3. Navegar pelo conhecimento no EventCatalog.
- Transição: o sistema já estava em andamento.
-->

---
title: "O sistema já estava em andamento."
sourceId: v2s02
index: 4
clicks: 0
eyebrow: "CONTEXTO / O SISTEMA"
scene: {"kind": "system"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <OpeningContextScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Sistema já em desenvolvimento.
- Código e diagramas mostravam os domínios.
- Dificuldade: entender a comunicação entre eles.
-->

---
title: "O que essa conexão significa?"
sourceId: v2s04
index: 5
clicks: 0
eyebrow: "CONTEXTO / A DIFICULDADE"
scene: {"kind": "questions"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <OpeningContextScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- A seta mostrava uma conexão, mas não seu significado.
- Faltavam mensagem e responsabilidade de cada domínio.
- Transição: três perguntas para investigar.
-->

---
title: "Três perguntas"
sourceId: slide_5
index: 6
clicks: 0
eyebrow: "CONTEXTO / O QUE EU PRECISAVA DESCOBRIR"
scene: {"layout": "rows", "items": [{"label": "SIGNIFICADO", "title": "Estamos consultando, solicitando uma mudança ou comunicando um fato?", "tone": "query"}, {"label": "RESPONSABILIDADE", "title": "Quem inicia, quem executa e quem reage?", "tone": "event"}, {"label": "REGISTRO", "title": "Onde essa interação está documentada?", "tone": "neutral"}]}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <StoryScene :step="$clicks" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Significado: consulta, mudança ou fato?
- Responsabilidade: quem inicia, executa e reage?
- Registro: onde isso está documentado?
- Transição: começar pelo significado.
-->

---
title: "Três propósitos de uma interação"
sourceId: p18
mergedSourceIds: ["p19", "slide_6"]
index: 7
clicks: 0
eyebrow: "CONCEITOS / PROPÓSITO"
scene: {"mode": "language", "labels": ["Query", "Command", "Event", "Três propósitos"]}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ConceptScene :mode="$frontmatter.scene.mode" :step="3" :animate="false" />
</DeckFrame>

<!--
- Query: consulta; busca informação.
- Command: solicitação; pede uma mudança.
- Event: fato; comunica algo que já aconteceu.
- Transição: ver cada propósito na prática.
-->

---
title: "Query busca informação"
sourceId: v2s08
index: 8
clicks: 0
eyebrow: "CONCEITOS / QUERY"
scene: {"mode": "query", "labels": ["Uma pergunta", "Solicitação enviada", "Leitura dos dados", "Resposta sem alteração"]}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ConceptLoopScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Pergunta: “Qual é meu saldo?”
- Conta executa GetBalance e devolve R$ 150.
- O estado de negócio permanece igual.
- Transição: para mudar algo, usamos Command.
-->

---
title: "Command solicita uma mudança"
sourceId: v2s09
index: 9
clicks: 0
eyebrow: "CONCEITOS / COMMAND"
scene: {"mode": "command", "labels": ["Uma intenção", "Responsável recebe", "Avaliação e execução", "Mudança concluída"]}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ConceptLoopScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Intenção: “Altere meu endereço.”
- Cadastro valida e executa ChangeAddress.
- O pedido pode ser aceito ou recusado.
- Transição: quando algo acontece, comunicamos um Event.
-->

---
title: "Event comunica um fato"
sourceId: v2s10
index: 10
clicks: 0
eyebrow: "CONCEITOS / EVENT"
scene: {"mode": "event", "labels": ["O fato já aconteceu", "Publicação", "Consumidores recebem", "Reações independentes"]}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ConceptLoopScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- PaymentReceived comunica um fato já ocorrido.
- O produtor publica; cada consumidor decide como reagir.
- Exemplos: painel e auditoria.
- Transição: significado não é transporte.
-->

---
title: "Semântica não é transporte"
sourceId: v2s12
index: 11
clicks: 3
eyebrow: "CONCEITOS / SIGNIFICADO E TRANSPORTE"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <SemanticsScene :step="$clicks" />
</DeckFrame>

<!--
- [click] Semântica: Query, Command e Event dizem o que a interação significa.
- [click] Mecanismos AWS: API Gateway, SQS e EventBridge.
- [click] São associações comuns, não regras fixas.
- Transição: responsabilidades.
-->

---
title: "Quem publica e quem reage têm responsabilidades"
sourceId: v7_http_response_event
index: 12
clicks: 0
eyebrow: "CONCEITOS / RESPONSABILIDADES"
scene: {"mode": "responsibilities", "labels": ["Responsabilidades", "Produtor", "Contrato", "Consumidor"]}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ConceptLoopScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Produtor publica o fato.
- Consumidor interpreta e reage.
- Contrato registra o entendimento compartilhado.
- Transição: aplicar essas responsabilidades a um exemplo fictício.
-->

---
title: "O sistema de pedidos na AWS"
sourceId: v4s14
index: 13
clicks: 0
eyebrow: "EXEMPLO FICTÍCIO / DOMÍNIOS E AWS"
scene: {"mode": "map"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <AwsScene :step="0" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Exemplo fictício usado no restante da palestra.
- Orders: API Gateway, Lambda e DynamoDB.
- EventBridge distribui mensagens para Inventory e Notifications; Inventory consulta uma API externa de estoque e Notifications entrega o e-mail pelo SES.
- Transição: aproximar nas duas interfaces de Orders.
-->

---
title: "Orders expõe duas interfaces"
sourceId: slide_7
index: 14
clicks: 2
eyebrow: "EXEMPLO / OPERAÇÕES HTTP E MENSAGENS"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <OrdersInterfacesScene :step="$clicks" />
</DeckFrame>

<!--
- Zoom no domínio Orders apresentado no mapa anterior.
- [click] HTTP: GetOrderById e CreateOrder.
- [click] Mensagens: OrderCreated para Inventory e Notifications.
- Duas interfaces do mesmo serviço.
- Transição: começar pelo OpenAPI.
-->

---
title: "Duas especificações, dois tipos de interface"
sourceId: spec_openapi_intro
mergedSourceIds: ["spec_asyncapi_intro"]
index: 15
clicks: 2
eyebrow: "CONTRATOS / OPENAPI E ASYNCAPI"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <SpecsOverviewScene :step="$clicks" />
</DeckFrame>

<!--
- [click] OpenAPI: operações HTTP, requisição e resposta.
- [click] AsyncAPI: mensagens, canais, envio e recebimento.
- Transição: comparar como cada especificação aparece em YAML.
-->

---
title: "As rotas de Orders no OpenAPI"
sourceId: v2s13
index: 16
clicks: 3
eyebrow: "CONTRATOS / OPENAPI"
scene: {"kind": "openapi"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ContractScene :step="$clicks" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- [click] Métodos: GET consulta; POST solicita criação.
- [click] operationId nomeia cada operação.
- [click] x-kind registra Query ou Command.
- Transição: mensagens no AsyncAPI.
-->

---
title: "O envio de OrderCreated no AsyncAPI"
sourceId: v2s14
mergedSourceIds: ["v4s19"]
index: 17
clicks: 3
eyebrow: "CONTRATOS / ASYNCAPI"
scene: {"kind": "asyncapi"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ContractScene :step="$clicks" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- [click] Canal: orderEvents; address default; x-protocol eventbridge.
- [click] Mensagem: OrderCreated / order.created.v1.
- [click] action send: Orders envia; nos contratos consumidores, action receive.
- A direção pertence à aplicação; o fato continua sendo OrderCreated.
- Transição: agora sabemos o que Orders oferece, publica e quem recebe; nomes consistentes conectam essas informações.
-->

---
title: "Nomes consistentes permitem ligar os contratos"
sourceId: v2s15
mergedSourceIds: ["v4s17"]
index: 18
clicks: 0
eyebrow: "CONTRATOS / CONVENÇÕES"
scene: {"layout": "rows", "items": [{"label": "OPERAÇÃO", "title": "operationId: CreateOrder", "body": "Identifica a operação HTTP", "tone": "command"}, {"label": "MENSAGEM", "title": "name: order.created.v1", "body": "Identifica o tipo de mensagem e sua versão no projeto", "tone": "event"}, {"label": "SIGNIFICADO", "title": "x-kind: event", "body": "Nossa extensão explicita a classificação da interação", "tone": "neutral"}], "takeaway": "Combinar, documentar e validar as convenções do projeto."}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <StoryScene :step="$clicks" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- operationId identifica a operação.
- message.name identifica e versiona a mensagem.
- x-kind explicita o significado.
- Transição: situar tudo na AWS.
-->

---
title: "Cada arquivo responde uma parte"
sourceId: v4s21
mergedSourceIds: ["slide_4"]
index: 19
clicks: 0
transition: none
eyebrow: "CONTRATOS / FONTES DA DOCUMENTAÇÃO"
scene: {"layout": "cards", "items": [{"title": "OpenAPI", "body": "Interface HTTP\nQuery · Command", "tone": "query", "icon": "/brands/openapi.png"}, {"title": "AsyncAPI", "body": "Mensagens e canais\nCommand · Event", "tone": "event", "icon": "/brands/asyncapi.png"}, {"title": "AWS SAM", "body": "Infraestrutura serverless em YAML\nLambda · EventBridge · SQS", "tone": "success", "icon": "/brands/aws-sam-introduction.png", "iconClass": "sam"}], "takeaway": "Essas três fontes se complementam; o próximo passo foi reuni-las numa visão navegável."}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <StoryScene :step="$clicks" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- OpenAPI: interface HTTP, Query e Command.
- AsyncAPI: mensagens e canais, Command e Event.
- SAM: infraestrutura serverless em YAML.
- Transição: reunir as fontes numa visão navegável.
-->

---
title: "Como apliquei isso no trabalho"
sourceId: v2s16
index: 20
clicks: 0
eyebrow: ""
scene: {"kind": "section"}
---

<ClosingScene :index="$frontmatter.index" v-bind="$frontmatter.scene" />

<!--
- Documentação organizada por domínio.
- Contratos + infraestrutura alimentam o gerador.
- Transição: encontro com o EventCatalog.
-->

---
title: "Encontrei o EventCatalog"
sourceId: eventcatalog_boyne_intro
index: 21
clicks: 0
eyebrow: "EVENTCATALOG / O PROJETO"
scene: {"name": "David Boyne", "role": "Criador do EventCatalog\nAutor do EDA Visuals", "body": "Documentação de serviços,\ncontratos e dependências.", "image": "/people/david-boyne.jpg", "href": "https://www.boyney.io/", "linkLabel": "boyney.io", "credit": "Foto: boyney.io", "projectImage": "/screenshots/eventcatalog-github.png", "projectHref": "https://github.com/event-catalog/eventcatalog", "projectLabel": "Repositório público · Open source"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ProfileScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- David Boyne: criador do EventCatalog e autor do EDA Visuals.
- O repositório é público e o projeto é open source.
- O catálogo conecta serviços, contratos e dependências.
- Valor: descobrir quem publica e quem consome.
- Transição: geração na pipeline.
-->

---
title: "Dos contratos ao catálogo"
sourceId: v2s19
mergedSourceIds: ["v4s24", "v4s25"]
index: 22
clicks: 3
eyebrow: "EVENTCATALOG / PIPELINE"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <PipelineScene :step="$clicks" />
</DeckFrame>

<!--
- [click] Fontes por domínio; a caixa mostra o que extraímos de OpenAPI, AsyncAPI e SAM.
- [click] A caixa sai; o CodePipeline coleta os repositórios, e os scripts Python validam e geram os recursos.
- [click] O pacote @eventcatalog/core recebe os recursos; npm run build produz o site estático em dist/.
- Transição: agora precisamos publicar sem substituir uma versão válida por uma inválida.
-->

---
title: "Publicação segura do catálogo"
sourceId: v4s26
index: 23
clicks: 3
eyebrow: "EVENTCATALOG / DEPLOY"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <DeployScene :step="$clicks" />
</DeckFrame>

<!--
- [click] Um script Python audita as páginas e os recursos do site gerado em dist/.
- [click] Se algo falhar, o deploy é interrompido e o catálogo atual permanece.
- [click] Se passar, o dist/ vai para o S3 privado e o CloudFront distribui a nova versão com Basic Auth.
- Um catálogo inválido nunca substitui a versão publicada.
- Transição: agora podemos consultar o resultado para um evento real.
-->

---
title: "Quem publica e quem consome OrderCreated"
sourceId: v4s27
index: 24
clicks: 2
eyebrow: "EVENTCATALOG / ORDERCREATED"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <CatalogScene :step="$clicks" />
</DeckFrame>

<!--
- [click] Orders publica OrderCreated.
- [click] Inventory e Notifications consomem.
- Transição: navegar pelo fluxo completo.
-->

---
title: "A criação de um pedido no EventCatalog"
sourceId: v6s30_catalog_flow
index: 25
clicks: 2
eyebrow: "EVENTCATALOG / FLUXO"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <CatalogFlowScene :step="$clicks" />
</DeckFrame>

<!--
- [click] CreateOrder → decisão: pedido aceito.
- [click] OrderCreated → Inventory e Notifications.
- Transição: contexto para desenvolvimento com IA.
-->

---
title: "Os YAMLs também são contexto para a IA"
sourceId: ai_architecture_context
index: 26
clicks: 3
eyebrow: "DESENVOLVIMENTO COM IA"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <AiContextScene :step="$clicks" />
</DeckFrame>

<!--
- O EventCatalog organiza a visão para humanos; os agentes se orientam pelos YAMLs versionados.
- [click] OpenAPI mostra operações; AsyncAPI, mensagens e relações; SAM, recursos AWS.
- [click] O agente propõe código e contratos atualizados juntos.
- [click] A CI valida as regras e a equipe revisa os efeitos da mudança.
- Os YAMLs reduzem suposições, mas não substituem validação nem revisão humana.
- Transição: benefício para toda a equipe.
-->

---
title: "A equipe passou a entender melhor o sistema"
sourceId: v2s20
index: 27
clicks: 2
eyebrow: "RESULTADO / NO DIA A DIA"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <OutcomeScene :step="$clicks" />
</DeckFrame>

<!--
- Resultado qualitativo: antes era necessário juntar arquivos e diagramas.
- [click] O catálogo fictício reúne três domínios, três serviços, cinco mensagens e um fluxo.
- [click] A equipe ganha um ponto de busca, navegação e visualização das relações.
- Transição: como começar.
-->

---
title: "Faça a documentação evoluir com o projeto"
sourceId: v2s21
index: 28
clicks: 2
eyebrow: "RECOMENDAÇÃO"
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <DocumentationLifecycleScene :step="$clicks" />
</DeckFrame>

<!--
- Use OpenAPI e AsyncAPI para registrar as interfaces; o SAM complementa com a infraestrutura declarativa.
- [click] Mantenha essas fontes versionadas e validadas junto ao código.
- [click] Gere o EventCatalog a partir delas: a documentação passa a evoluir com o projeto.
- Transição: convite final.
-->

---
title: "Comece por um fluxo do seu sistema"
sourceId: v2s22
index: 29
clicks: 0
eyebrow: ""
scene: {"kind": "closing"}
---

<ClosingScene :index="$frontmatter.index" v-bind="$frontmatter.scene" />

<!--
- Nem tudo precisa virar evento.
- Distinguir consulta, intenção e fato.
- Registrar responsáveis e consumidores.
- Convite: começar por um fluxo do próprio sistema.
-->
