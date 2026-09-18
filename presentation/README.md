# De rotas HTTP a eventos: uma jornada prática para pensar EDA

Apresentação em Slidev para o AWS Community Day Sul 2026: **29 slides**, preservando o rastreamento dos IDs do Google Slides. O título original foi preservado. Texto, código e diagramas são editáveis; somente as visualizações do EventCatalog usam capturas. O total atual está definido em `lib/deck.ts`.

O projeto é independente de `event-catalog`. Não executa backend, serviços AWS ou o catálogo. Fontes, retratos, ícones e capturas são locais. A instalação inicial exige internet; a apresentação pode funcionar sem recursos externos depois de instalada.

## Executar

Requisitos: Node.js 22.18 ou posterior e npm.

```bash
cd presentation
npm ci
npm run dev
```

[Abrir apresentação](http://127.0.0.1:3031/1). O script verifica a disponibilidade da porta 3031 e não encerra outros processos. O servidor escuta apenas no computador local.

- Seta direita ou espaço: próxima etapa; depois da última etapa, próximo slide.
- Seta esquerda: etapa anterior, inclusive ao voltar de outro slide.
- Mouse: use as setas nos controles do rodapé.
- Visão geral: use o botão “Show slide overview” para escolher um slide.
- [Modo apresentador](http://127.0.0.1:3031/presenter/1): notas e marcadores de clique.
- Tela cheia: botão do Slidev; Esc para sair.

As etapas por clique aguardam o próximo avanço. Os slides 9, 10 e 11 usam loops automáticos, descritos abaixo. O mapa do EventCatalog usa um vídeo local. Movimento reduzido é respeitado. Os 8–10 minutos eram a referência do piloto de oito slides; a duração da versão completa deve ser medida em ensaio.

## Testes, build e PDF

```bash
npm test
npm run build
npm run preview
npm run export:pdf
```

O build fica em `dist/`. A [prévia do build](http://127.0.0.1:3032) usa cache HTTP desativado e política de conteúdo que restringe recursos à própria origem. Sirva a pasta por HTTP, em vez de abrir o HTML por `file://`.

A exportação gera `artifacts/de-rotas-http-a-eventos.pdf`, incluindo os cliques. PDFs históricos não foram importados para este repositório. O Chromium necessário é instalado com `playwright-chromium`; caso a instalação de browsers tenha sido desabilitada, execute `npx playwright install chromium` enquanto estiver conectado.

## Publicação

O build usa base `/` e mantém as notas e o modo apresentador no site público. A infraestrutura SAM da raiz oferece bucket e CloudFront próprios para este projeto. Com a stack já criada, execute da raiz:

```bash
./infra/scripts/deploy-presentation.sh --region us-east-1
```

Para a primeira publicação dos dois projetos, use `deploy-all.sh`. Região, perfil AWS e nome da stack são configuráveis; consulte [infra/README.md](../infra/README.md). GitHub Actions faz apenas validações.

## QR codes do encerramento

O slide 29 oferece QR codes para o repositório GitHub do projeto e para o EventCatalog.
As URLs e os rótulos ficam em `lib/published-links.json`. Para atualizar os SVGs
locais em `public/qrcodes/`, execute `npm run generate:qrcodes` e depois
`npm test`. O teste compara os assets com os links configurados para impedir
que um QR antigo seja publicado com um link diferente.

Os códigos têm 184px de lado, com 96px entre os cartões e URLs longas que se
ajustam à largura disponível. Usam preto sobre branco, margem de quatro módulos e correção de
erros M. A verificação de navegador em `infra/` decodifica as imagens realmente
renderizadas no slide, além de conferir os links clicáveis.

## Conteúdo e edição

- `slides.md`: sequência completa, títulos, parâmetros das cenas, cliques e notas em português. Os marcadores `[click]` acompanham as etapas.
- `lib/deck.ts`: nome original e total de slides, compartilhados pelos componentes.
- `components/`: cenas de narrativa, perfis, consulta, comandos/eventos, AWS, contratos, pipeline e capturas guiadas.
- `styles/`: geometria, tipografia Inter/Roboto Mono local, cores e transições.
- `public/`: somente assets locais utilizados na apresentação.
- `docs/source-slides.json`: texto, notas e IDs da fonte consultada em 8 de setembro de 2026.
- [Mapeamento completo](docs/migration-map.md): rastreabilidade dos slides originais, incluindo fusões e mudanças de ordem.
- [Atribuições](ATTRIBUTIONS.md): origem das imagens e referências.

Fonte: [Palestra — De rotas HTTP a eventos — v6 EDA Visuals](https://docs.google.com/presentation/d/1mCKu8z5A75LjKv9DMogJ3vux7H_5u-AWgqD2PUXEMBE/edit). O Google Slides foi consultado, sem alterações.

O mapa de cores é azul para Query, magenta para Command e laranja para Event; serviços neutros. As capturas reais mantêm as cores do catálogo. Os estados de processamento e conclusão também têm texto. As notas originais foram preservadas ou adaptadas ao ritmo dos cliques; a cópia literal permanece em `docs/source-slides.json`.

Para acrescentar uma etapa, atualizar `clicks`, os estados da cena e a nota correspondente. Ao acrescentar slides, atualizar o total em `lib/deck.ts` e o mapeamento. O teste de cobertura exige que os 37 IDs da fonte sejam rastreáveis na ordem definida; a fusão de p18, p19 e slide_6 é registrada em mergedSourceIds. Slides novos sem origem no Google Slides usam `authored: true`, sem alterar o snapshot histórico.

## Ensaio com alvo de 30 minutos

Os 40 minutos de palco permitem reservar cerca de 10 minutos para perguntas e margem. Esta divisão é uma meta de ensaio, não uma duração medida da nova versão:

| Bloco | Slides | Tempo-alvo | Acumulado |
|---|---|---|---|
| Contexto, problema e promessa | 1–7 | 4 min | 4 min |
| Conceitos aplicados ao sistema AWS | 8–13 | 6 min | 10 min |
| Contratos e fontes | 14–18 | 6 min | 16 min |
| Da descoberta do projeto à publicação | 19–22 | 5 min | 21 min |
| Exploração guiada do EventCatalog | 23–24 | 6 min | 27 min |
| Resultado, recomendação, IA e conclusão | 25–29 | 3 min | 30 min |

O slide 7 apresenta a promessa da palestra, sem cliques, entre as três perguntas e os conceitos; ele é uma pausa breve dentro do tempo da abertura.

O slide 28 fecha essa promessa antes do agradecimento. O ganho é a mensagem principal, em tipografia grande: acompanhar a arquitetura enquanto ela evoluía. Abaixo, um percurso discreto retoma as três dúvidas (significado, responsabilidades e registro), os contratos como conhecimento explícito e o catálogo como relações navegáveis. Sem cliques; a frase completa fica nas notas, e a síntese ocupa cerca de 30 segundos dentro do bloco final.

O exemplo de IA fica no slide 27, após resultado e recomendação, imediatamente antes da conclusão. Seu foco é manter a documentação atualizada: desenvolvimento com código e contratos na mesma mudança, revisão humana e um script no CI/CD que cruza OpenAPI e AsyncAPI com a infraestrutura declarada no SAM. A checagem de conformidade usa os mapeamentos e convenções do projeto para relacionar rotas, canais e recursos; não se limita à sintaxe dos YAMLs. A IA consulta os YAMLs e apoia a atualização; as verificações automatizadas cobrem regras explícitas, não garantem sozinhas a correção semântica.

A investigação começa pela fala de transição do deploy, com uma mudança hipotética na criação de pedidos, sem um slide de roteiro separado. O mapa identifica serviços e relações; o schema permite discutir os dados esperados. O slide 24 mantém o formato de detalhes do evento e schema no clique. A captura de detalhes foi atualizada: CreateOrder publica o evento para Notifications; Inventory recebe o comando ReserveInventory. O enquadramento amplo anterior foi restaurado nos dois estados. O vídeo do mapa ilustra relações, não tráfego de produção.

O resultado relatado por Eduardo é maior entendimento arquitetural enquanto o sistema se desenvolvia, acompanhado visualmente pela documentação. O resultado leva diretamente à recomendação final; não há um bloco separado sobre observabilidade. O slide 20 conta como Eduardo conheceu o trabalho de David Boyne no Serverless Land, pelo EDA Visuals, antes de aplicar o EventCatalog; toda a trajetória fica visível, sem cliques intermediários. As notas dos slides 23–24 reservam mais tempo para explorar o serviço, os contratos, as mensagens e os consumidores no catálogo real, com as capturas como apoio.

### Roteiro da demonstração do catálogo

O catálogo local foi conferido em `http://127.0.0.1:3117`. Esse endereço é apenas para ensaio e depende do servidor local; no palco, usar a versão publicada ou as capturas já incluídas nos slides.

1. Abrir [Create Order](http://127.0.0.1:3117/docs/services/orders-create-order/1.0.0). Mostrar a Lambda do domínio Orders e os links dos contratos.
2. Apontar [OpenAPI](http://127.0.0.1:3117/docs/services/orders-create-order/1.0.0/spec/openapi) e [AsyncAPI](http://127.0.0.1:3117/docs/services/orders-create-order/1.0.0/asyncapi/asyncapi): as fontes vistas anteriormente agora estão ligadas ao serviço.
3. Abrir o [mapa do serviço](http://127.0.0.1:3117/visualiser/services/orders-create-order/1.0.0). Localizar a tabela e seguir as duas saídas: ReserveInventory para Inventory; OrderCreated para Notifications.
4. Em Outbound Messages, abrir uma mensagem; mostrar o canal e quem a recebe. Comparar o comando de reserva com o fato de pedido criado.
5. No evento OrderCreated, abrir Schema (JSON). Consultar os campos obrigatórios e discutir como avaliar uma alteração do contrato com os envolvidos.

Não é necessário demonstrar todas as funcionalidades do produto. O objetivo é responder à pergunta da mudança de pedidos; se a navegação atrasar, os slides 23 e 24 mantêm a mesma sequência com vídeo e captura.

## Precisão do exemplo

O bloco conceitual usa exemplos independentes: saldo, endereço e pagamento recebido. Os loops repetem a explicação, sem representar novas transações. Query mantém o estado de negócio; Command pode ser recusado; Event comunica um fato ocorrido, mas sua entrega pode falhar. O slide 12 aplica transporte e responsabilidades ao sistema de pedidos: CreateOrder chega por HTTP, ReserveInventory segue por SQS e Orders publica OrderCreated para Notifications. O slide 13 introduz a necessidade dos contratos a partir das interfaces de Orders; o slide 17 detalha o envelope com metadata e data. O exemplo reaparece no catálogo. O banco não é o produtor do evento no desenho AWS; quem publica é a Lambda de Orders.

Os YAMLs são recortes; `x-kind` é extensão do projeto. `send` e `receive` expressam direção relativa à aplicação. O relato de melhoria na compreensão é qualitativo, sem métricas inventadas. O fluxo com IA descreve o processo relatado pelo palestrante, não uma automação garantida pelo catálogo.

## Verificação

`npm test` cobre os estados de solicitação/processamento/criação, retorno e consumidores, além de preservar título, sequência dos IDs, notas e existência das mídias locais. Evidências e renders locais ficam em `artifacts/`, ignorados pelo Git. Evidências e backups da migração original permanecem no workspace de origem.

A instalação ainda reporta avisos transitivos de `image-size@2.0.2`, trazido pelo exportador PPTX do Slidev. O uso atual é local, com assets conhecidos e PDF; reavaliar antes de publicar ou importar imagens de terceiros. DOMPurify está fixado em 3.4.15 por override.

Durante a edição local, alterações no conteúdo dos slides recarregam as abas para renovar a numeração e a contagem de cliques. Alterações somente nas notas mantêm a atualização ao vivo do editor.

Os slides 9, 10 e 11 usam loops automáticos de 9 segundos, sem controles ou indicadores de reprodução na tela. Cada loop para ao sair e reinicia ao voltar. A seta direita avança para o próximo slide. A reprodução sincroniza abas na mesma origem e navegador. Com movimento reduzido, inicia pausado. A exportação mantém o último quadro de cada conceito como síntese estática. Os demais slides continuam por clique.

Backups `old/` permanecem no workspace de origem e não são importados. Inspirações e páginas de EDA Visuals estão em `docs/2026-09-09-inspiracoes-eda-visuals.md`.

## Revisão do fluxo — 14/09/2026

A abertura apresenta perguntas que os conceitos respondem. A revisão de 14 de setembro aplicava esse vocabulário aos contratos nos slides 13–21. Os documentos em `docs/` registram essa evolução histórica; a ordem atual está em `slides.md`. A versão anterior completa, incluindo PDF e hashes, permanece no workspace de origem.
