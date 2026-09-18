---
theme: default
author: Eduardo Pedó Gutkoski
info: Apresentação com 27 slides e fluxos conceituais animados.
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
- Transição: quando entrei na Destrava Aí, o sistema já estava em andamento.
-->

---
title: "Quando entrei na Destrava Aí, o sistema já estava em andamento"
sourceId: v2s02
index: 4
clicks: 0
eyebrow: "CONTEXTO / MINHA CHEGADA"
scene: {"kind": "system"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <OpeningContextScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Quando entrei na Destrava Aí, a empresa estava migrando partes do sistema para uma arquitetura serverless e orientada a eventos na AWS.
- Já existiam vários domínios se comunicando, mas a documentação ainda era predominantemente estática.
- Um dos meus principais pontos de partida era um diagrama que mostrava essas conexões.
- Transição: mas enxergar as conexões não era o mesmo que entendê-las.
-->

---
title: "O diagrama mostrava conexões, mas não o que elas significavam"
sourceId: v2s04
index: 5
clicks: 0
eyebrow: "CONTEXTO / A LACUNA"
scene: {"kind": "questions"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <OpeningContextScene v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- O diagrama mostrava que um domínio se conectava a outro.
- Ele não mostrava o que trafegava, quem decidia ou quem reagia.
- Essa lacuna me levou a aprofundar a documentação.
- Transição: organizei minhas dúvidas em três perguntas.
-->

---
title: "Eu precisava responder três perguntas"
sourceId: slide_5
index: 6
clicks: 0
eyebrow: "CONTEXTO / O QUE EU PRECISAVA DESCOBRIR"
scene: {"layout": "rows", "items": [{"label": "SIGNIFICADO", "title": "É uma consulta, uma solicitação de mudança ou um fato?", "tone": "query"}, {"label": "RESPONSABILIDADE", "title": "Quem inicia, quem decide e quem reage?", "tone": "event"}, {"label": "REGISTRO", "title": "Onde esse conhecimento está registrado?", "tone": "neutral"}]}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <StoryScene :step="$clicks" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Para entender cada interação, organizei minhas dúvidas em três perguntas.
- Significado: consulta, solicitação de mudança ou fato?
- Responsabilidade: quem inicia, decide e reage?
- Registro: onde esse conhecimento está registrado?
- Transição: apresentar o caminho que encontrei para responder a essas dúvidas.
-->

---
title: "Das dúvidas à arquitetura em evolução"
authored: true
index: 7
clicks: 0
---

<PromiseScene :index="$frontmatter.index" />

<!--
- Promessa: sair das dúvidas para uma documentação que acompanha a arquitetura.
- Pausa breve depois de “acompanhar a arquitetura”.
- Transição: “O primeiro passo foi entender o significado de cada interação.”
-->

---
title: "Três propósitos de uma interação"
sourceId: p18
mergedSourceIds: ["p19", "slide_6"]
index: 8
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
index: 9
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
index: 10
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
index: 11
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
- Transição: “Agora vamos juntar essas ideias num sistema de pedidos na AWS.”
-->

---
title: "O sistema de pedidos na AWS"
sourceId: v4s14
mergedSourceIds: ["v2s12", "v7_http_response_event"]
index: 12
clicks: 4
eyebrow: "EXEMPLO FICTÍCIO / DOMÍNIOS E AWS"
scene: {"mode": "execution"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <AwsScene :step="$clicks" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Exemplo fictício: pedidos, estoque e notificações.
- [click] Cliente pede a criação: CreateOrder chega a Orders por HTTP, via API Gateway.
- [click] Orders valida e grava o pedido no DynamoDB.
- [click] Orders pede a reserva: outro comando, ReserveInventory, vai por SQS até Inventory e sua API de estoque.
- Dois comandos pedem mudanças; um chega por HTTP, o outro por uma fila. O propósito não depende do transporte.
- [click] Orders publica OrderCreated no EventBridge; Notifications reage enviando o e-mail pelo SES.
- Responsabilidades no exemplo: Orders publica o fato; Inventory cuida da reserva; Notifications cuida do aviso.
- Transição: “Como documentar o que Orders oferece e comunica?”
-->

---
title: "Orders expõe operações e mensagens"
sourceId: slide_7
index: 13
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
- [click] Mensagens: ReserveInventory para Inventory; OrderCreated para Notifications.
- Dois tipos de interface, três interações.
- Contrato: registra as operações, mensagens e dados esperados por quem integra.
- Transição: “Vamos documentar essas interfaces com OpenAPI e AsyncAPI.”
-->

---
title: "Duas especificações, dois tipos de interface"
sourceId: spec_openapi_intro
mergedSourceIds: ["spec_asyncapi_intro"]
index: 14
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
index: 15
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
title: "Command e Event no AsyncAPI"
sourceId: v2s14
mergedSourceIds: ["v4s19"]
index: 16
clicks: 2
eyebrow: "CONTRATOS / ASYNCAPI"
scene: {"kind": "asyncapi"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <ContractScene :step="$clicks" v-bind="$frontmatter.scene" />
</DeckFrame>

<!--
- Recorte didático; as operações continuam no arquivo completo.
- [click] Onde circula: address e x-protocol distinguem SQS e EventBridge.
- [click] O que circula: mensagem, nome versionado e x-kind.
- x-protocol e x-kind são extensões do projeto.
- Transição: agora sabemos o que Orders oferece, publica e quem recebe; nomes consistentes conectam essas informações.
-->

---
title: "Um evento carrega contexto e dados de negócio"
sourceId: v2s15
mergedSourceIds: ["v4s17"]
index: 17
clicks: 3
eyebrow: "CONTRATOS / CONVENÇÕES"
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <EventPayloadScene :step="$clicks" />
</DeckFrame>

<!--
- O AsyncAPI classifica a mensagem com x-kind: event; aqui vemos o envelope que circula no EventBridge.
- [click] source identifica o domínio produtor. detail-type segue domínio.evento.versão.
- [click] metadata guarda identidade, versão, instante e correlação. eventId também apoia idempotência.
- [click] data contém somente os dados de negócio que os consumidores usam.
- Transição: contratos e infraestrutura respondem partes complementares do sistema.
-->

---
title: "Cada arquivo responde uma parte"
sourceId: v4s21
mergedSourceIds: ["slide_4"]
index: 18
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
index: 19
clicks: 0
eyebrow: ""
scene: {"kind": "section"}
---

<ClosingScene :index="$frontmatter.index" v-bind="$frontmatter.scene" />

<!--
- Documentação organizada por domínio.
- Contratos + infraestrutura alimentam o gerador.
- Transição: antes da solução, como conheci o trabalho do David Boyne.
-->

---
title: "Do EDA Visuals ao EventCatalog"
sourceId: eventcatalog_boyne_intro
index: 20
clicks: 0
eyebrow: "MINHA JORNADA / A REFERÊNCIA"
scene: {"name": "David Boyne", "role": "Autor do EDA Visuals\nCriador do EventCatalog", "body": "Conheci seu trabalho no Serverless Land, pelo EDA Visuals.", "image": "/people/david-boyne.jpg", "href": "https://eda-visuals.boyney.io/", "linkLabel": "Conheça o EDA Visuals", "credit": "Foto: boyney.io", "projectImage": "/screenshots/eventcatalog-github.png", "projectHref": "https://github.com/event-catalog/eventcatalog", "projectLabel": "Repositório público · Open source"}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <div class="discovery-scene">
    <ProfileScene v-bind="$frontmatter.scene" />
    <div class="discovery-trail" aria-label="Do aprendizado à aplicação no trabalho">
      <div><span>APRENDER / SERVERLESS LAND</span><strong>EDA Visuals</strong></div>
      <b aria-hidden="true">→</b>
      <div><span>CONHECER O PROJETO</span><strong>EventCatalog</strong></div>
      <b aria-hidden="true">→</b>
      <div><span>APLICAR NO TRABALHO</span><strong>Destrava Aí</strong></div>
    </div>
  </div>
</DeckFrame>

<!--
- Alvo: 1,5–2 min. “Conheci o trabalho do David Boyne no Serverless Land, pelo EDA Visuals.”
- Conteúdo visual para aprender EDA; relacionar com os conceitos que acabamos de ver.
- Depois, o EventCatalog: um projeto open source do mesmo autor para documentar e explorar o sistema.
- Apontar o repositório. EDA Visuals é o material de aprendizado; EventCatalog é a ferramenta.
- Na Destrava Aí, apliquei essa ferramenta às informações que estávamos documentando nos YAMLs.
- Transição: “Vou mostrar como reunimos essas fontes numa documentação navegável.”
-->

---
title: "Dos contratos ao catálogo"
sourceId: v2s19
mergedSourceIds: ["v4s24", "v4s25"]
index: 21
clicks: 3
eyebrow: "EVENTCATALOG / PIPELINE"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <PipelineScene :step="$clicks" />
</DeckFrame>

<!--
- [click] Fontes por domínio; a caixa mostra o que extraímos de OpenAPI, AsyncAPI e SAM.
- [click] O CodePipeline coleta os repositórios; o gerador lê os YAMLs e cria os recursos.
- [click] O pacote @eventcatalog/core recebe os recursos; npm run build produz o site estático em dist/.
- Transição: o build produz um site estático pronto para publicação.
-->

---
title: "Do build ao catálogo publicado"
sourceId: v4s26
index: 22
clicks: 3
eyebrow: "EVENTCATALOG / DEPLOY"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <DeployScene :step="$clicks" />
</DeckFrame>

<!--
- O EventCatalog gera um site estático em dist/.
- [click] O artefato está pronto para publicação.
- [click] O S3 hospeda os arquivos estáticos.
- [click] O CloudFront entrega o catálogo para o time.
- Transição: o catálogo está publicado. Imagine que precisamos alterar a criação de pedidos: que relações precisamos consultar?
-->

---
title: "As relações ficam navegáveis"
sourceId: v6s30_catalog_flow
index: 23
clicks: 2
eyebrow: "EVENTCATALOG / MAPA REAL"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <CatalogFlowScene :step="$clicks" />
</DeckFrame>

<!--
- Alvo: 3–4 min. Captura real do EventCatalog do exemplo fictício; vídeo em loop.
- Demo local: [abrir CreateOrder](http://127.0.0.1:3117/docs/services/orders-create-order/1.0.0). Requer o catálogo rodando; sem ele, seguir nas capturas.
- Na demonstração: abrir o serviço CreateOrder. Mostrar sua responsabilidade, domínio e contratos associados.
- Voltar ao mapa: serviços, dados e mensagens conectados. A Lambda é um serviço; DynamoDB aparece como dados.
- [click] Esquerda: localizar CreateOrder e a tabela. O que esse serviço envia?
- Identificar ReserveInventory, um comando por SQS, e OrderCreated, um evento por EventBridge. No catálogo, abrir cada mensagem e conferir seu canal.
- [click] Direita: seguir o comando até Inventory e o evento até Notifications.
- Pergunta: “Para mudar a criação do pedido, com quais partes do sistema preciso me preocupar?” Seguir cada relação com calma.
- Transição: encontramos os envolvidos. Agora precisamos entender o contrato da mensagem.
-->

---
title: "Além do mapa, cada recurso tem contexto"
sourceId: v4s27
index: 24
clicks: 1
eyebrow: "EVENTCATALOG / ORDERCREATED"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <CatalogScene :step="$clicks" />
</DeckFrame>

<!--
- O EventCatalog não mostra apenas a ligação: cada recurso tem contexto próprio.
- No evento, consultamos produtor, consumidor, owner e o fluxo em que ele aparece.
- [click] Também abrimos o JSON Schema versionado da mensagem: metadata, data e os campos obrigatórios.
- Transição: voltar ao ganho real de acompanhar a arquitetura no trabalho.
-->

---
title: "O ganho foi acompanhar a arquitetura em evolução"
sourceId: v2s20
index: 25
clicks: 2
eyebrow: "RESULTADO / NO DIA A DIA"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <OutcomeScene :step="$clicks" />
</DeckFrame>

<!--
- Alvo: 1–1,5 min. Voltar ao problema da minha chegada à Destrava Aí.
- O sistema ainda estava sendo desenvolvido; eu precisava entender a arquitetura.
- [click] O principal benefício foi ampliar esse entendimento, enxergando as relações entre os domínios.
- [click] A documentação permitia acompanhar visualmente o sistema enquanto ele evoluía.
- A captura é do exemplo fictício; o benefício relatado é da experiência na empresa, sem métricas quantitativas.
- Transição: “Esse foi o ganho para nós. Minha recomendação é manter a documentação evoluindo junto com o projeto.”
-->

---
title: "Faça a documentação evoluir com o projeto"
sourceId: v2s21
index: 26
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
- Transição: “Para manter isso atualizado, a documentação precisa fazer parte do desenvolvimento e do CI/CD — inclusive quando usamos IA.”
-->

---
title: "Benefícios para o desenvolvimento com IA"
sourceId: ai_architecture_context
index: 27
clicks: 3
eyebrow: "DESENVOLVIMENTO COM IA / CI/CD"
scene: {}
---

<DeckFrame :index="$frontmatter.index" :eyebrow="$frontmatter.eyebrow" :title="$frontmatter.title" :step="$clicks" :total="$frontmatter.clicks">
  <AiContextScene :step="$clicks" />
</DeckFrame>

<!--
- O maior ganho é manter a documentação atualizada; a IA também aproveita esse contexto.
- Exemplo: alterar CreateOrder exige revisar código e contratos na mesma mudança.
- [click] O agente consulta OpenAPI, AsyncAPI e SAM. O catálogo é a visão para as pessoas.
- [click] No desenvolvimento: orientar a IA a atualizar os contratos; a equipe revisa código e documentação juntos.
- [click] No CI/CD: um script cruza OpenAPI e AsyncAPI com a infraestrutura declarada no SAM para verificar a conformidade entre eles.
- Conferir rotas, canais e recursos usando os mapeamentos e convenções do projeto; não apenas a sintaxe dos YAMLs.
- Os scripts verificam regras explícitas; a revisão humana continua necessária para avaliar o significado da mudança.
- Transição: retomar as três perguntas do começo e o ganho dessa jornada.
-->

---
title: "Das dúvidas ao entendimento do sistema"
authored: true
index: 28
clicks: 0
eyebrow: "CONCLUSÃO"
---

<ConclusionScene :index="$frontmatter.index" />

<!--
- Retomar: significado, responsabilidades e registro.
- Contratos → conhecimento explícito. Catálogo → relações navegáveis.
- Fechar com o ganho: acompanhar a arquitetura em evolução.

“No começo, eu precisava entender o significado das interações, as responsabilidades e onde esse conhecimento estava registrado. Os contratos tornaram isso explícito, e o catálogo tornou essas relações navegáveis. O ganho foi conseguir acompanhar a arquitetura enquanto ela evoluía.”
-->

---
title: "Obrigado!"
sourceId: v2s22
index: 29
clicks: 0
eyebrow: ""
scene: {"kind": "closing"}
---

<ClosingScene :index="$frontmatter.index" v-bind="$frontmatter.scene" />

<!--
- Agradecer pela presença.
- Os QR codes abrem o repositório GitHub deste projeto e o EventCatalog publicado. Os links também são clicáveis.
-->
