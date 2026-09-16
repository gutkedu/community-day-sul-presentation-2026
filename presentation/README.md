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

As etapas por clique aguardam o próximo avanço. Os slides 7, 8, 9, 10 e 12 usam loops automáticos, descritos abaixo. Não há vídeos ou GIFs. Movimento reduzido é respeitado. Os 8–10 minutos eram a referência do piloto de oito slides; a duração da versão completa deve ser medida em ensaio.

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

Para acrescentar uma etapa, atualizar `clicks`, os estados da cena e a nota correspondente. Ao acrescentar slides, atualizar o total em `lib/deck.ts` e o mapeamento. O teste de cobertura exige que os 37 IDs da fonte sejam rastreáveis na ordem definida; a fusão de p18, p19 e slide_6 é registrada em mergedSourceIds.

## Precisão do exemplo

O bloco conceitual usa exemplos independentes: saldo, endereço e pagamento recebido. Os loops repetem a explicação, sem representar novas transações. Query mantém o estado de negócio; Command pode ser recusado; Event comunica um fato ocorrido, mas sua entrega pode falhar. O contrato no slide 12 representa entendimento e dependência, não um serviço intermediário. O exemplo de pedidos reaparece nos contratos e no catálogo. O banco não é o produtor do evento no desenho AWS; quem publica é a Lambda de Orders.

Os YAMLs são recortes; `x-kind` é extensão do projeto. `send` e `receive` expressam direção relativa à aplicação. O relato de melhoria na compreensão é qualitativo, sem métricas inventadas. O fluxo com IA descreve o processo relatado pelo palestrante, não uma automação garantida pelo catálogo.

## Verificação

`npm test` cobre os estados de solicitação/processamento/criação, retorno e consumidores, além de preservar título, sequência dos IDs, notas e existência das mídias locais. Evidências e renders locais ficam em `artifacts/`, ignorados pelo Git. Evidências e backups da migração original permanecem no workspace de origem.

A instalação ainda reporta avisos transitivos de `image-size@2.0.2`, trazido pelo exportador PPTX do Slidev. O uso atual é local, com assets conhecidos e PDF; reavaliar antes de publicar ou importar imagens de terceiros. DOMPurify está fixado em 3.4.15 por override.

Durante a edição local, alterações no conteúdo dos slides recarregam as abas para renovar a numeração e a contagem de cliques. Alterações somente nas notas mantêm a atualização ao vivo do editor.

Os slides 7, 8, 9, 10 e 12 usam loops automáticos de 9 segundos, sem controles ou indicadores de reprodução na tela. Cada loop para ao sair e reinicia ao voltar. A seta direita avança para o próximo slide. A reprodução sincroniza abas na mesma origem e navegador. Com movimento reduzido, inicia pausado. A exportação mantém o último quadro de cada conceito como síntese estática. Os demais slides continuam por clique.

Backups `old/` permanecem no workspace de origem e não são importados. Inspirações e páginas de EDA Visuals estão em `docs/2026-09-09-inspiracoes-eda-visuals.md`.

## Revisão do fluxo — 14/09/2026

A abertura apresenta perguntas que os conceitos respondem. A revisão de 14 de setembro aplicava esse vocabulário aos contratos nos slides 13–21. Os documentos em `docs/` registram essa evolução histórica; a ordem atual está em `slides.md`. A versão anterior completa, incluindo PDF e hashes, permanece no workspace de origem.
