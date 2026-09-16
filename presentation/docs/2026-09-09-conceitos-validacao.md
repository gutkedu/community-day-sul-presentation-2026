# Validação do bloco conceitual

Slides 8–13: cinco cenas animadas, cada uma com quatro estados e ciclo de nove segundos; slide 9 como mapa estático. Título original preservado. Nenhuma dependência nova.

- `npm test`: 16 testes aprovados, incluindo separação entre solicitação e conclusão, fato anterior à publicação, pausa, reinício e estado estático fora da cena ativa.
- `npm run build`: concluído com sucesso após as correções finais.
- Navegador: pausa manteve o quadro, avanço manual percorreu os estados, reinício preservou a pausa, saída desativou a cena e revisita retomou do início. Pausa sincronizada entre audiência e apresentador no slide 13.
- Notas do slide 13 conferidas no apresentador, incluindo a transição para semântica e transporte.
- Os vinte estados foram exportados em PNG para `artifacts/concepts-review/`. Inspeção visual das cinco sínteses; corrigidas quebras de linha e a seta de comunicação, que passa sob o contrato sem sugerir um intermediário de execução.
- PDF completo exportado com 90 páginas. Conferidos contagem e textos do novo bloco, sem controles de reprodução ou quebras de linha literais. Loops exportados como sínteses estáticas.
- Os 18 arquivos do backup `old/2026-09-09-slides-08-13/` mantêm os hashes originais.

Limites: não houve nova inspeção visual de todas as 90 páginas nem teste do sistema operacional com movimento reduzido ativado. O suporte existente à preferência foi mantido no componente. A validação anterior de fontes locais não foi repetida com rede bloqueada nesta revisão.
