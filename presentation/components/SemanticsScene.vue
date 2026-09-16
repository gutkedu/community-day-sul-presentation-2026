<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ step: number }>()
const current = computed(() => Math.max(0, Math.min(3, Math.trunc(props.step))))

const meanings = [
  { term: 'Query', description: 'Consultar informação', tone: 'query' },
  { term: 'Command', description: 'Solicitar uma mudança', tone: 'command' },
  { term: 'Event', description: 'Comunicar um fato', tone: 'event' },
]

const mechanisms = [
  { title: 'Síncrono', description: 'Aguarda uma resposta', example: 'API Gateway', icon: '/aws/api-gateway.png' },
  { title: 'Fila assíncrona', description: 'Processa depois', example: 'SQS', icon: '/transport/sqs.svg' },
  { title: 'Publicação de eventos', description: 'Distribui fatos', example: 'EventBridge', icon: '/aws/eventbridge.png' },
]
</script>

<template>
  <section class="semantics-transport" :data-step="current">
    <article class="axis-band" :class="{ focused: current === 1, settled: current === 3 }">
      <header><span class="label">SEMÂNTICA</span><h2>O que a interação significa?</h2></header>
      <div class="meaning-grid">
        <div v-for="item in meanings" :key="item.term" class="meaning-item" :class="item.tone">
          <strong>{{ item.term }}</strong><span>{{ item.description }}</span>
        </div>
      </div>
    </article>

    <div class="not-equal" aria-label="não é igual">≠</div>

    <article class="axis-band" :class="{ focused: current === 2, settled: current === 3 }">
      <header><span class="label">MECANISMOS NA AWS</span><h2>Como a interação pode acontecer?</h2></header>
      <div class="mechanism-grid">
        <div v-for="item in mechanisms" :key="item.title" class="mechanism-item">
          <div><strong>{{ item.title }}</strong><span>{{ item.description }}</span></div>
          <b><img :src="item.icon" alt="" />{{ item.example }}</b>
        </div>
      </div>
    </article>

    <p class="caveat" :class="{ visible: current === 3 }">Associações comuns, não regras fixas.</p>
  </section>
</template>

<style scoped>
.semantics-transport { position:relative; display:grid; grid-template-columns:1fr 72px 1fr; gap:20px; height:418px; align-items:start; }
.axis-band { height:350px; padding:22px 24px; border:1px solid #30465c; border-radius:12px; background:#102135; opacity:.48; transition:opacity .3s,border-color .3s,background .3s; }
.axis-band.focused,.axis-band.settled { opacity:1; border-color:#6f879d; background:#142a3e; }
.axis-band header { padding-bottom:15px; border-bottom:1px solid var(--line); }
.axis-band h2 { margin:7px 0 0; font-size:24px; line-height:1.2; font-weight:500; }
.meaning-grid,.mechanism-grid { display:grid; gap:9px; padding-top:12px; }
.meaning-item { display:grid; grid-template-columns:125px 1fr; align-items:center; min-height:64px; padding:12px 14px; border-left:3px solid currentColor; background:#172c40; }
.meaning-item strong,.mechanism-item strong { font-size:21px; font-weight:600; }
.meaning-item span,.mechanism-item span { color:#c0d0de; font-size:14px; }
.mechanism-item { display:grid; grid-template-columns:minmax(0,1fr) 118px; align-items:center; gap:8px; min-height:68px; padding:9px 10px; overflow:hidden; border-left:3px solid #7890a6; background:#172c40; color:var(--text); }
.mechanism-item>div { display:flex; min-width:0; flex-direction:column; gap:5px; }
.mechanism-item strong { font-size:17px; line-height:1.15; }
.mechanism-item b { display:flex; align-items:center; justify-content:center; gap:6px; min-height:42px; padding:5px; border:1px solid #52667c; border-radius:6px; color:var(--text); font-size:12px; font-weight:500; white-space:nowrap; }
.mechanism-item img { width:27px; height:27px; object-fit:contain; }
.query { color:var(--query); }.command { color:var(--command); }.event { color:var(--event); }
.not-equal { align-self:center; justify-self:center; display:grid; place-items:center; width:44px; height:44px; margin-top:-35px; border:1px solid #70879c; border-radius:50%; background:#0b1b2b; color:#d5e1ec; font-size:28px; line-height:1; }
.caveat { position:absolute; right:18px; bottom:-6px; margin:0!important; padding:8px 12px; border-radius:6px; background:#172c40; color:#d3dfeb; font-size:15px; opacity:0; transform:translateY(5px); transition:opacity .3s,transform .3s; }
.caveat.visible { opacity:1; transform:translateY(0); }
</style>
