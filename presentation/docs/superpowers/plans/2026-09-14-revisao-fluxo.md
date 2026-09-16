# Revisão do fluxo — plano de implementação

**Objetivo:** aplicar a revisão aprovada dos slides 3–24, ligando problema, conceitos, contratos e infraestrutura; preservar o nome, loops e conteúdo posterior.

**Arquitetura:** slides.md continua centralizando conteúdo e fala. Reutilizar StoryScene e ConceptLoopScene; criar OrdersInterfacesScene para o mapa lógico das interfaces. Atualizar ContractScene apenas na explicação que acompanha os recortes, sem alterar os contratos de origem.

**Stack:** Slidev, Vue, TypeScript, CSS local. Execução nesta sessão; sem Plane, branch, worktree, commit, remoto ou alterações no EventCatalog.

- [x] Preservar a versão atual em old/2026-09-14-antes-revisao-fluxo/ com hashes e PDF.
- [x] Reorganizar os números antigos nesta ordem: 1,2,3,4,5,6,7+8,9,10,11,13,12,14,15,16,17,18,19,22,20,21,23,24,25–36. Renumerar 1–35 e preservar todos os 37 IDs da fonte, incluindo os três IDs reunidos no novo slide 7.
- [x] Reformular agenda e slide 6 como perguntas-guia; reunir 7/8; revisar notas e transições dos conceitos.
- [x] Usar mapa lógico no antigo 15: cliente, operações HTTP de Orders, OrderCreated e consumidores, em posição fixa, com dois destaques por clique. Infraestrutura fica no antigo 23.
- [x] Encurtar introduções OpenAPI/AsyncAPI, alinhar a promessa do contrato aos recortes, colocar produtores/consumidores após AsyncAPI e reduzir a síntese/convenções ao necessário para ligar arquivos ao catálogo.
- [x] Atualizar teste existente de sequência, total compartilhado, README, referência de fala e mapa de migração. Conferir que slides antigos 25–36 mudam somente a numeração.
- [x] Executar npm test e npm run build; exportar PDF completo com cliques; revisar visualmente os slides modificados e testar navegação antes/depois da reorganização no navegador.

**Aceitação:** a abertura faz perguntas que os conceitos respondem; o exemplo apresenta as interfaces antes do YAML; send/receive permanecem juntos; a AWS aparece como implementação após contratos. Loops sem controles visíveis, título original, fontes e assets locais preservados. 35 slides, com numeração coerente e PDF atualizado.
