# Bloco conceitual com loops — implementação autorizada

Objetivo: substituir o roteiro de pedidos nos slides 8–13 por conceitos, exemplos independentes e fluxos em loop inspirados no EDA Visuals v1.2.0. Preservar o título, os slides restantes e o arquivo old/.

Arquitetura: ConceptLoopScene controla reprodução e sincronização por cena, usando as funções já testadas de consumer-loop.ts. ConceptScene desenha os cinco conceitos em Vue/SVG; lib/concepts.ts centraliza os estados. O mapa do slide 9 fica estático. Nenhum novo pacote, backend ou recurso externo.

- [x] Implementar cenas de propósitos, Query, Command, Event e responsabilidades; cada uma com quatro estados e ciclo de nove segundos.
- [x] Preservar pausa, avanço manual, reinício, movimento reduzido, parada ao sair e estado final estático na exportação.
- [x] Atualizar slides.md, notas e a transição do slide 7; conectar o novo slide 13 ao slide 14 existente e preservar os IDs da fonte.
- [x] Atualizar mapeamento, atribuições e README; manter o backup sem mudanças.
- [x] Testar os estados, exportar todos os quadros para revisão visual, testar controles reais e executar build.

Validação: npm test; npm run build; exportação de um deck temporário contendo os vinte estados dos cinco loops; navegação, pausa, avanço e retorno no navegador. A exportação normal terá uma página estática por slide em loop. Sem Plane, branches, commits, remotos ou subagentes.
