# Inspirações para o bloco de conceitos — proposta em discussão

Fonte analisada: `/Users/eduardo.gutkoski/Documents/eda-visuals.pdf`, David Boyne, EDA Visuals v1.2.0, 136 páginas. Numeração abaixo corresponde às páginas do PDF. Nenhum slide ativo foi alterado nesta análise. A versão anterior está em `old/2026-09-09-slides-08-13/`.

## Seleção e aplicação sugerida

| Página | Material | O que aproveitar |
|---|---|---|
| 9 | What are events? | Evento como registro de um fato ocorrido. Mudanças posteriores não alteram o fato histórico registrado. |
| 54 | Commands vs Events | Comparação visual entre solicitar uma ação e comunicar um fato. Command dirigido a um responsável lógico; Event pode interessar a vários consumidores. Evitar ensinar “um consumidor” como limite de instâncias de processamento. |
| 39 | Understanding publish & subscribe messaging | Um produtor, uma publicação e consumidores independentes. Mostrar a entrada de um novo interessado sem acompanhar um fluxo de pedidos. |
| 105 | Producer and consumer responsibilities | Separar quem publica/mantém o contrato de quem interpreta/processa a mensagem. Boyne apresenta uma base adaptável, não uma divisão universal de ownership de infraestrutura. |
| 55 | Explicit vs Implicit Events | Nomes e contratos claros reduzem suposições. Boa ligação com schemas, OpenAPI e AsyncAPI. |
| 117–118 | Document your event-driven architecture | O produtor pode não conhecer seus consumidores; a equipe precisa descobrir relações, formatos e versões. Ligação direta com EventCatalog. |
| 31 | Sync vs Async Communication | Apoio para revisar a precisão do slide 14: síncrono/assíncrono é uma dimensão diferente de Query/Command/Event. |

As figuras das páginas 9, 39, 54, 55, 105 e 117 foram inspecionadas visualmente. Renders locais em `artifacts/eda-reference-review/`.

## Direção sugerida, ainda não aprovada

- 8: ações familiares permitem distinguir consulta, intenção e fato; sem introduzir um fluxo fictício contínuo.
- 9: mapa breve de Query, Command e Event.
- 10: Query — solicitação de informação e resposta. Complemento didático nosso; não atribuir esse slide à figura Commands vs Events como se ela ensinasse as três categorias.
- 11: Command — uma intenção dirigida ao responsável, que avalia e executa. Dois exemplos independentes; nenhuma encenação de payload inválido.
- 12: Event — fato ocorrido, publicação e reações independentes. Animação curta pode mostrar um novo consumidor se juntando; não implica entrega garantida ou ausência de contrato.
- 13: responsabilidades de produtor e consumidor, com o contrato compartilhado entre eles. Encerrar com a necessidade humana de descobrir quem publica, quem consome e o que a mensagem significa.

A ligação com o slide 14 continua sendo: significado e responsabilidades primeiro; tecnologias depois. Os contratos entram no slide 15 em diante. É possível avaliar mover o slide de responsabilidades para junto dos contratos, mas nenhuma renumeração foi aprovada.

## Forma de apresentar

Escrever primeiro uma fala de 30–45 segundos por conceito; em seguida desenhar uma mudança visual para cada ponto. Usar nomes independentes, sem IDs de pedidos ou dependência de lembrar estados do slide anterior. Recriar diagramas em Vue/SVG com atribuição a Boyne e página da inspiração. As páginas completas do livro têm vários painéis e texto pequeno, adequados à leitura, mas cada slide deve desenvolver apenas uma ideia.

Tipos de eventos, event sourcing, idempotência, coreografia/orquestração e padrões de integração são candidatos a leitura complementar. Acrescentá-los ao bloco exige rever objetivo e tempo; não fazem parte da proposta atual.
