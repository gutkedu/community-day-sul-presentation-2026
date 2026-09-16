# Expansão para os 37 slides originais

Objetivo: manter o título “De rotas HTTP a eventos: uma jornada prática para pensar EDA” e migrar os 37 slides do Google Slides, na mesma ordem, para o visual já aprovado do Slidev.

Escopo autorizado: somente presentation-slidev; Google Slides e EventCatalog preservados. Sem Plane, branches, worktrees, commits ou publicação. A aprovação do piloto orienta o visual desta expansão.

## Execução

- [x] Ler a fonte atual e salvar texto, notas e IDs em `docs/source-slides.json`; confirmar 37 slides e título da capa. Guardar cópia do piloto em `artifacts/full-migration/pilot-before`.
- [x] Corrigir CoverScene e DeckFrame para título original e paginação compartilhada de 37 slides em `lib/deck.ts`.
- [x] Criar cenas Vue reutilizáveis para perfis, cartões, relações, consulta, arquitetura AWS e pipeline. Manter os componentes de fluxo, contratos e ampliação do piloto.
- [x] Expandir `slides.md`, mantendo um `sourceId` por slide na ordem original, texto editável e notas originais mais explicação dos cliques.
- [x] Copiar retratos, marcas, ícones AWS e captura do fluxo para public, com origem e atribuição documentadas.
- [x] Adicionar teste de cobertura da fonte: igualdade entre a sequência `sourceId` do Markdown e os 37 IDs da fonte; título original; notas em todos os slides; referências locais de mídia existentes.
- [x] Executar testes e build; exportar PDF com todos os cliques. Conferir todos os estados renderizados e reparar defeitos de legibilidade e geometria.
- [x] Validar navegação, retorno, notas e recursos locais no navegador; atualizar README, mapeamento e evidências; abrir a capa na porta 3031.

## Decisões de conteúdo

- Não substituir slides por capturas rasterizadas. Capturas somente para o EventCatalog; texto, código e diagramas permanecem editáveis.
- Slides 12–14 preservam os três assuntos originais em sua ordem: Command, Event, resposta HTTP/evento. O cenário de recusa aprovado permanece no slide de Command.
- A comparação send/receive terá seu próprio slide 23, além da explicação progressiva do recorte de Orders no slide 20.
- As afirmações históricas e as notas são transportadas da fonte, sem introduzir novas promessas de entrega ou métricas.
- O encerramento conserva o LinkedIn; o QR do GitHub pendente na fonte não vira um link fictício.
- A duração de 8–10 minutos pertencia ao piloto e deixa de se aplicar à versão completa. O ensaio da palestra completa definirá o tempo.
