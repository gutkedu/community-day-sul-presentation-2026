<script setup lang="ts">
import { computed } from 'vue'
import { conceptState, type ConceptMode } from '../lib/concepts'
const props = defineProps<{ mode: ConceptMode; step: number; animate?: boolean }>()
const state = computed(() => conceptState(props.step))
const frame = computed(() => state.value.frame)
const language = [
  { term: 'Query', translation: 'Consulta', purpose: 'Busca uma informação', tone: 'query' },
  { term: 'Command', translation: 'Solicitação', purpose: 'Pede uma mudança', tone: 'command' },
  { term: 'Event', translation: 'Fato', purpose: 'Comunica algo que já aconteceu', tone: 'event' },
]
const takeaways = {
  language: ['Uma pergunta pede informação.', 'Uma intenção pede uma mudança.', 'Um fato comunica o que já aconteceu.', 'O propósito da interação vem antes da tecnologia.'],
  query: ['Uma Query começa com uma pergunta.', 'A consulta é dirigida a quem possui a informação.', 'O serviço busca os dados para responder.', 'A informação volta. O estado de negócio permanece igual.'],
  command: ['Um Command expressa o que alguém quer que aconteça.', 'A intenção chega ao responsável pela mudança.', 'O responsável verifica se pode executar a ação.', 'Neste caso, a mudança foi realizada. O Command era a solicitação.'],
  event: ['O fato já aconteceu antes de ser publicado.', 'O produtor comunica esse fato aos interessados.', 'Cada consumidor recebe a mensagem e decide como reagir.', 'Um mesmo fato pode gerar reações diferentes.'],
  responsibilities: ['Produtor e consumidor têm responsabilidades diferentes.', 'O produtor publica o fato e mantém seu contrato.', 'O contrato descreve o significado, os campos e a versão.', 'O consumidor interpreta a mensagem e executa sua parte.'],
}
</script>

<template>
  <section class="concept-scene" :class="`concept-${mode}`" :data-concept-frame="frame">
    <template v-if="mode === 'language'">
      <div class="concept-column-labels label"><span>TERMO</span><span>SIGNIFICADO</span></div>
      <article v-for="(item, i) in language" :key="item.term" class="language-row" :class="[item.tone, { highlighted: frame === i || frame === 3 }]">
        <h2>{{ item.term }}</h2><span class="language-arrow" aria-hidden="true">→</span><div><strong>{{ item.translation }}</strong><span>{{ item.purpose }}</span></div>
      </article>
    </template>

    <template v-else-if="mode === 'query' || mode === 'command'">
      <div class="concept-diagram">
        <svg viewBox="0 0 1152 278" class="concept-wires" aria-hidden="true">
          <path d="M240 110H456m-12-6 12 6-12 6" :class="{ lit: frame >= 1 }" />
          <path d="M696 110H912m-12-6 12 6-12 6" :class="{ lit: frame >= 2 }" />
          <path v-if="mode === 'query'" d="M456 182H240m12-6-12 6 12 6" :class="{ lit: frame === 3 }" />
          <circle v-if="animate && frame === 1" :key="`${mode}-send`" class="concept-packet packet-send" cx="250" cy="110" r="5" />
          <circle v-if="animate && frame === 2" :key="`${mode}-read`" class="concept-packet packet-right" cx="706" cy="110" r="5" />
          <circle v-if="animate && mode === 'query' && frame === 3" class="concept-packet packet-return" cx="446" cy="182" r="5" />
        </svg>
        <article class="concept-node node-left" :class="{ emphasized: frame === 0 || (mode === 'query' && frame === 3) }">
          <span class="label">QUEM SOLICITA</span><h2>{{ mode === 'query' ? 'Qual é\nmeu saldo?' : 'Altere meu\nendereço.' }}</h2>
          <span class="concept-status">{{ mode === 'query' && frame === 3 ? 'Resposta: R$ 150' : mode === 'query' ? 'Busca uma informação' : 'Expressa uma intenção' }}</span>
        </article>
        <article class="concept-node node-middle" :class="{ emphasized: frame === 1 || frame === 2 }">
          <span class="label">QUEM PODE ATENDER</span><h2>{{ mode === 'query' ? 'Conta' : 'Cadastro' }}</h2><code>{{ mode === 'query' ? 'GetBalance' : 'ChangeAddress' }}</code>
          <span class="concept-status">{{ mode === 'query' ? (frame >= 2 ? 'Consulta os dados' : 'Recebe a pergunta') : (frame >= 2 ? 'Avalia e executa' : 'Recebe a solicitação') }}</span>
        </article>
        <article class="concept-node node-right" :class="{ emphasized: frame >= 2 }">
          <span class="label">{{ mode === 'query' ? 'ESTADO DE NEGÓCIO' : 'RESULTADO' }}</span><h2>{{ mode === 'query' ? state.balance : state.changed ? 'Endereço\natualizado' : 'Mudança\nsolicitada' }}</h2>
          <span class="concept-status" :class="{ complete: mode === 'query' || state.changed }">{{ mode === 'query' ? 'O saldo permanece igual' : state.changed ? '✓ Alteração concluída' : 'Ainda não concluída' }}</span>
        </article>
        <span class="wire-caption first">{{ mode === 'query' ? 'consulta' : 'solicitação' }}</span><span class="wire-caption second">{{ mode === 'query' ? 'leitura' : 'execução' }}</span>
      </div>
    </template>

    <template v-else-if="mode === 'event'">
      <div class="concept-diagram event-diagram">
        <svg viewBox="0 0 1152 278" class="concept-wires" aria-hidden="true">
          <path d="M240 140H430m-12-6 12 6-12 6" :class="{ lit: state.published }" />
          <path d="M720 140H805V66H904m-12-6 12 6-12 6M805 140V221H904m-12-6 12 6-12 6" :class="{ lit: state.reacting }" />
          <circle v-if="animate && frame === 1" class="concept-packet event-send" cx="250" cy="140" r="5" />
          <g v-if="animate && frame === 2" class="concept-packet event-fanout"><circle cx="886" cy="66" r="6"/><circle cx="886" cy="221" r="6"/></g>
        </svg>
        <article class="concept-node event-producer" :class="{ emphasized: frame <= 1 }"><span class="label">PRODUTOR</span><h2>Pagamento<br>recebido</h2><span class="concept-status complete">✓ O fato já aconteceu</span></article>
        <article class="concept-node event-message" :class="{ emphasized: state.published }"><span class="label">FATO COMUNICADO</span><code>PaymentReceived</code><p>“Um pagamento foi recebido.”</p><span class="concept-status">{{ state.published ? 'Mensagem publicada' : 'Pronto para comunicar' }}</span></article>
        <article v-for="(reaction, i) in ['Atualizar um painel', 'Registrar auditoria']" :key="reaction" class="concept-node event-consumer" :style="{ top: `${i * 155 + 8}px` }" :class="{ emphasized: state.reacting }"><span class="label">CONSUMIDOR {{ i + 1 }}</span><h3>{{ reaction }}</h3><span class="concept-status">{{ state.reacting ? 'Decide como reagir' : 'Interessado nesse fato' }}</span></article>
      </div>
    </template>

    <template v-else>
      <div class="concept-diagram responsibility-diagram">
        <svg viewBox="0 0 1152 278" class="concept-wires" aria-hidden="true"><path d="M268 245H884m-12-6 12 6-12 6" :class="{ lit: frame >= 1 }"/><path d="M576 216V245" stroke-dasharray="4 5" :class="{ lit: frame >= 2 }"/><circle v-if="animate && frame === 1" class="concept-packet responsibility-send" cx="278" cy="245" r="5"/><circle v-if="animate && frame === 3" class="concept-packet responsibility-receive" cx="736" cy="245" r="5"/></svg>
        <article class="concept-node responsibility-producer" :class="{ emphasized: frame === 1 || frame === 3 }"><span class="label">PRODUTOR</span><h2>Publica o fato</h2><p>Define o que a mensagem significa.</p><span class="concept-status">Mantém e evolui o contrato</span></article>
        <article class="concept-node responsibility-contract" :class="{ emphasized: frame >= 2 }"><span class="label">CONTRATO</span><h2>Entendimento<br>compartilhado</h2><div class="contract-fields"><span>Significado</span><span>Campos</span><span>Versão</span></div></article>
        <div class="responsibility-contract-parts" :class="{ emphasized: frame >= 2 }">
          <span class="label">ESTRUTURA DO CONTRATO</span>
          <div class="responsibility-parts-row">
            <div class="responsibility-part">
              <code>metadata</code>
              <span>Identidade · versão · correlação</span>
            </div>
            <span class="responsibility-part-divider">+</span>
            <div class="responsibility-part">
              <code>data</code>
              <span>Conteúdo de negócio</span>
            </div>
          </div>
        </div>
        <article class="concept-node responsibility-consumer" :class="{ emphasized: frame === 3 }"><span class="label">CONSUMIDOR</span><h2>Reage ao fato</h2><p>Interpreta a mensagem e executa sua parte.</p><span class="concept-status">Depende desse contrato</span></article>
      </div>
    </template>
    <p v-if="mode !== 'language' && mode !== 'query'" class="concept-takeaway">{{ takeaways[mode][frame] }}</p>
  </section>
</template>

<style scoped>
.concept-scene { --tone:var(--query); height:377px; }
.concept-command { --tone:var(--command); }.concept-event,.concept-responsibilities { --tone:var(--event); }
.concept-column-labels { display:grid; grid-template-columns:610px 1fr; padding:0 22px 13px; font-size:11px; }
.language-row { height:85px; display:grid; grid-template-columns:550px 60px 1fr; align-items:center; margin-bottom:10px; padding:0 22px; border:1px solid #344b61; border-radius:12px; background:#102135; transition:border-color .4s,background .4s; }
.language-row.highlighted { border-color:currentColor; background:#1a2b3d; }
.language-row h2 { font-size:26px; color:var(--text); margin:0; font-weight:500; }
.language-row strong { font-size:26px; font-weight:500; }.language-row>div { display:flex; align-items:center; gap:24px; }.language-row>div>span { color:#adc0d3; font-size:18px; }.language-arrow { font-size:31px; }
.concept-diagram { height:278px; position:relative; }
.concept-wires { position:absolute; inset:0; width:1152px; height:278px; fill:none; stroke-width:2; stroke:#334b61; }
.concept-wires path { transition:stroke .4s; }.concept-wires .lit { stroke:var(--tone); }
.concept-packet { fill:var(--tone); stroke:none; animation-duration:.8s; animation-timing-function:linear; animation-fill-mode:both; }
.packet-send,.packet-right { animation-name:packet-right; }.packet-return { animation-name:packet-left; }.event-send { animation-name:event-send; }.event-fanout { animation-name:packet-flash; }.responsibility-send,.responsibility-receive { animation-name:responsibility-send; }
.concept-node { position:absolute; top:50px; width:240px; height:205px; padding:22px 19px; border:1px solid #3b526a; border-radius:13px; background:#102135; transition:border-color .4s,background .4s; }
.concept-node.emphasized { border-color:var(--tone); background:#1b3044; }
.node-left { left:0; }.node-middle { left:456px; }.node-right { left:912px; }
.concept-node .label { font-size:10px; letter-spacing:1px; }.concept-node h2 { white-space:pre-line; font-size:29px; line-height:1.2; font-weight:500; margin:17px 0; letter-spacing:-.6px; }
.concept-node h3 { font-size:20px; font-weight:500; margin:12px 0; }.concept-node p { font-size:17px; line-height:1.4; color:#c5d4e2; margin:12px 0; }
.concept-scene .concept-node code { display:block; font-size:20px; color:var(--tone); }
.concept-status { display:block; font-size:13px; line-height:1.4; color:#b6cadd; }.concept-status.complete { color:var(--success); }
.wire-caption { position:absolute; top:78px; font-size:12px; color:var(--tone); width:216px; text-align:center; }.wire-caption.first { left:240px; }.wire-caption.second { left:696px; }
.concept-examples { display:flex; align-items:center; gap:23px; height:39px; border-top:1px solid #2c4359; padding-top:9px; color:#b5c8d9; font-size:15px; }
.concept-examples .label { font-size:10px; }.concept-scene .concept-examples code { color:var(--tone); font-size:17px; }.concept-examples strong { font-weight:400; font-size:21px; color:var(--text); }
.concept-takeaway { font-size:21px; line-height:1.35; padding:10px 16px; margin:17px 0 0!important; border-left:3px solid var(--tone); background:#112337; }
.event-producer { left:0; top:45px; height:200px; }.event-message { left:430px; top:45px; width:290px; height:200px; }.concept-scene .event-message code { margin-top:25px; font-size:23px; }.event-consumer { left:904px; width:248px; height:112px; padding:15px 17px; }.event-consumer h3 { margin:8px 0; }.event-consumer .concept-status { font-size:12px; }
.responsibility-producer { left:0; top:28px; width:268px; height:230px; }.responsibility-contract { left:426px; top:0; width:300px; height:216px; }.responsibility-consumer { left:884px; top:28px; width:268px; height:230px; }
.responsibility-diagram h2 { font-size:27px; }.contract-fields { display:flex; gap:7px; margin-top:23px; }.contract-fields span { border:1px solid #547086; padding:5px 8px; border-radius:5px; font-size:12px; color:#d3e1ed; }
.responsibility-contract-parts { position:absolute; z-index:2; left:361px; top:220px; width:430px; padding:10px 12px 11px; border:1px solid #3b526a; border-radius:9px; background:#0d1b2b; box-shadow:0 12px 30px #02070d99; transition:border-color .4s,background .4s; }
.responsibility-contract-parts.emphasized { border-color:var(--event); background:#30241c; }
.responsibility-contract-parts>.label { display:block; margin-bottom:7px; color:var(--event); font-size:9px; letter-spacing:1px; }
.responsibility-parts-row { display:grid; grid-template-columns:1fr 22px 1fr; align-items:stretch; }
.responsibility-part { padding:7px 9px; border-left:2px solid var(--event); background:#152638; }
.responsibility-part code,.responsibility-part span { display:block; }
.concept-scene .responsibility-part code { color:#f1c39f; font-size:13px; line-height:1.2; }
.responsibility-part span { margin-top:3px; color:#b8c9d9; font-size:10px; line-height:1.25; }
.responsibility-part-divider { display:flex; align-items:center; justify-content:center; color:#71879d; font-size:17px; }
@keyframes packet-right { from { transform:translateX(0); opacity:0; } 15% { opacity:1; } 85% { opacity:1; } to { transform:translateX(194px); opacity:0; } }
@keyframes packet-left { from { transform:translateX(0); opacity:0; } 15% { opacity:1; } 85% { opacity:1; } to { transform:translateX(-194px); opacity:0; } }
@keyframes event-send { from { transform:translateX(0); opacity:0; } 15% { opacity:1; } 85% { opacity:1; } to { transform:translateX(168px); opacity:0; } }
@keyframes responsibility-send { from { transform:translateX(0); opacity:0; } 15% { opacity:1; } 85% { opacity:1; } to { transform:translateX(136px); opacity:0; } }
@keyframes packet-flash { 0%,100% { opacity:0; } 35%,75% { opacity:1; } }
@media (prefers-reduced-motion:reduce) { .concept-packet { display:none; } }
</style>
