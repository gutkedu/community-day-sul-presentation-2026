# Fontes e atribuições

- Conteúdo e experiência: Eduardo Pedó Gutkoski. Exemplo fictício de Orders, Inventory e Notifications, adaptado da apresentação Google Slides v6. Não representa a arquitetura interna da Destrava AI.
- Captura `public/catalog/order-created-map.png`: cópia de `.codex/slide-agenda-eventcatalog/captures/order-created-map-clean.png` do projeto PalestraCommunityDay. Origem registrada em `capture-graphs.cjs`: visualização `/visualiser/events/OrderCreated/1.0.0` do catálogo local, em 1600×600. Os enquadramentos por CSS ampliam regiões da captura, sem alterar os nomes e relações. A apresentação não depende desses caminhos externos para executar.
- EventCatalog: [eventcatalog.dev](https://www.eventcatalog.dev/), criado por David Boyne. É o software mostrado na captura, não o motor desta apresentação.
- `public/screenshots/eventcatalog-event-details-current.png`: captura real atualizada da página local `/docs/events/OrderCreated/1.0.0`, com CreateOrder como produtor e OrderCreatedConsumer de Notifications como consumidor. A imagem anterior foi preservada, mas não é exibida no slide 23.
- Jornada pessoal do slide 19: Eduardo relata ter conhecido o trabalho de David Boyne no Serverless Land pelo EDA Visuals. Referências: [EDA Visuals — site do autor](https://eda-visuals.boyney.io/) e [coleção histórica hospedada pelo Serverless Land](https://serverlessland.s3.amazonaws.com/pdf/eda-visuals-v0.0.23.pdf). A sequência pessoal foi informada pelo palestrante; não representa uma cronologia de lançamento dos projetos.
- Referência conceitual dos diagramas: David Boyne, EDA Visuals v1.2.0, p. 54, conforme a atribuição da apresentação original. Diagramas desta apresentação foram redesenhados em SVG/HTML/CSS.
- OpenAPI 3.1: [especificação](https://spec.openapis.org/oas/v3.1.0.html).
- AsyncAPI 3.0: [especificação](https://www.asyncapi.com/docs/reference/specification/v3.0.0).
- Fontes Inter e Roboto Mono: pacotes `@fontsource/inter` e `@fontsource/roboto-mono`, incluídos localmente no bundle. Licenças SIL Open Font License nos respectivos pacotes instalados.
- Slidev e tema default: [sli.dev](https://sli.dev/), licenças dos respectivos pacotes. Nenhum asset da apresentação de Alex Rios foi copiado.

## Assets da migração completa

- `public/people/eduardo.png`: cópia de `.codex/slide-speaker-photo/eduardo-sobre-mim.png`, o mesmo retrato utilizado no slide “Sobre mim”. Máscara circular por CSS, sem gerar ou retocar a pessoa.
- `public/people/david-boyne.jpg`: cópia de `.codex/slide-boyne/david-boyne.jpg`, usada no slide original. Origem: https://www.boyney.io/static/images/avatar.jpg.
- `public/aws/*.png`: cópias dos ícones locais em `assets/aws-services/`, utilizados no sistema fictício da apresentação original; marcas dos serviços AWS pertencem à Amazon Web Services.
- `public/aws/s3.svg` e `public/aws/cloudfront.svg`: AWS Architecture Service Icons, pacote oficial Q3 2026 da Amazon Web Services.
- `public/brands/openapi.png` e `asyncapi.png`: cópias de `.codex/slide-spec-logos/openapi-mark-white.png` e `asyncapi-mark.png`, usadas na fonte original. Marcas dos respectivos projetos OpenAPI Initiative e AsyncAPI.
- `public/catalog/create-order-flow.png`: captura local em alta resolução do EventCatalog, 3840×1440. Registra o fluxo CreateOrder → decisão → OrderCreated → Inventory/Notifications sem a navegação lateral. Nenhuma relação foi alterada.
- Pipeline e resultado: referência conceitual informada nos slides originais a David Boyne, EDA Visuals v1.2.0, páginas 117 e 119. Composições reconstruídas em Vue/CSS.
- A fonte atual, com 37 slides, foi lida diretamente pelo conector Google Drive/Slides. O conector não materializou a exportação PDF nesta sessão; a referência visual utilizou renders locais anteriores, combinados com o conteúdo e a estrutura atualizados lidos da fonte. Os diagramas alterados desde esses renders foram migrados a partir da estrutura e notas atuais.

## Ícones de comunicação — slide 14

- `public/transport/{grpc,graphql,sqs,sns,rabbitmq,kafka}.svg`: SVG Logos, de Gil Barbara, via [coleção Iconify](https://github.com/iconify/icon-sets/blob/master/json/logos.json), obtidos em 8 de setembro de 2026. Arte distribuída sob CC0; licença copiada em `public/transport/LICENSE-svg-logos.txt`. As marcas pertencem aos respectivos projetos e empresas. Kafka é exibido em branco e gRPC com luminosidade aumentada por CSS para contraste.
- `public/transport/activemq.png`: [logo vertical branco oficial do Apache ActiveMQ](https://activemq.apache.org/assets/img/activemq_logo_white_vertical.png). Marca da Apache Software Foundation, exibida sem alteração.
- EventBridge reutiliza `public/aws/eventbridge.png`, com origem registrada acima.
- `public/transport/http.svg`: símbolo de globo desenhado em SVG para esta apresentação; representa comunicação HTTP, sem pretensão de ser uma marca oficial.

## Bloco conceitual animado — slides 8–13

Diagramas recriados em Vue/SVG, inspirados em David Boyne, *EDA Visuals* v1.2.0: p. 54 (Commands vs Events), pp. 9 e 39 (eventos e pub/sub), p. 105 (responsabilidades), p. 55 (contratos explícitos) e pp. 117–118 (documentação). Fonte consultada: PDF fornecido pelo palestrante, `eda-visuals.pdf`. Os slides de Query e exemplos de saldo/endereço são complementos didáticos próprios. Nenhuma imagem das páginas do livro é usada na apresentação; renders para estudo ficam em artifacts/eda-reference-review/.
