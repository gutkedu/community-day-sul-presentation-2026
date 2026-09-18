<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ step: number }>()
const current = computed(() => Math.max(0, Math.min(3, Math.trunc(props.step))))

const interactions = [
  { name: 'CreateOrder', prompt: 'Criar um pedido', meaning: 'Command', definition: 'Solicita uma mudança', mechanism: 'API Gateway', transport: 'HTTP síncrono', icon: '/aws/api-gateway.png', tone: 'command' },
  { name: 'ReserveInventory', prompt: 'Reservar o estoque', meaning: 'Command', definition: 'Solicita uma mudança', mechanism: 'SQS', transport: 'Fila assíncrona', icon: '/transport/sqs.svg', tone: 'command' },
  { name: 'OrderCreated', prompt: 'Pedido foi criado', meaning: 'Event', definition: 'Comunica um fato', mechanism: 'EventBridge', transport: 'Distribuição de eventos', icon: '/aws/eventbridge.png', tone: 'event' },
]
</script>

<template>
  <section class="semantics-examples" :data-step="current">
    <div class="semantics-head"><span>INTERAÇÃO</span><span>SIGNIFICADO</span><span>MECANISMO NA AWS</span></div>
    <article v-for="(item, index) in interactions" :key="item.name" class="semantics-example" :class="[item.tone, { visible: current >= index + 1, active: current === index + 1 }]">
      <div class="interaction-card"><code>{{ item.name }}</code><span>{{ item.prompt }}</span></div>
      <span class="example-arrow" aria-hidden="true">→</span>
      <div class="meaning-card"><strong>{{ item.meaning }}</strong><span>{{ item.definition }}</span></div>
      <span class="example-arrow" aria-hidden="true">→</span>
      <div class="mechanism-card"><img :src="item.icon" alt="" /><div><strong>{{ item.mechanism }}</strong><span>{{ item.transport }}</span></div></div>
    </article>
    <p class="semantics-conclusion" :class="{ visible: current === 3 }"><strong>Dois Commands.</strong> Transportes diferentes.</p>
  </section>
</template>

<style scoped>
.semantics-examples { position:relative; height:418px; }
.semantics-head { display:grid; grid-template-columns:1fr 1fr 1.1fr; gap:70px; padding:0 18px 10px; color:#8fa6ba; font:10px 'Roboto Mono'; letter-spacing:1.2px; }
.semantics-example { display:grid; grid-template-columns:1fr 35px 1fr 35px 1.1fr; gap:10px; align-items:center; min-height:91px; margin-bottom:12px; opacity:.16; transform:translateY(7px); transition:opacity .35s,transform .35s; }
.semantics-example.visible { opacity:.66; transform:none; }.semantics-example.active { opacity:1; }
.interaction-card,.meaning-card,.mechanism-card { min-height:74px; padding:14px 16px; border:1px solid #344b63; border-left:3px solid currentColor; border-radius:9px; background:#102135; }
.interaction-card,.meaning-card { display:flex; flex-direction:column; justify-content:center; gap:8px; }
.interaction-card code { color:#e1ecf5; font-size:17px; }.interaction-card span,.meaning-card span,.mechanism-card span { color:#aec0d0; font-size:12px; }
.meaning-card strong,.mechanism-card strong { color:currentColor; font-size:18px; font-weight:600; }
.mechanism-card { display:grid; grid-template-columns:48px 1fr; align-items:center; gap:13px; }.mechanism-card img { width:44px; height:44px; object-fit:contain; }.mechanism-card div { display:flex; flex-direction:column; gap:7px; }
.example-arrow { color:#607c94; font-size:24px; text-align:center; }.command { color:var(--command); }.event { color:var(--event); }
.semantics-conclusion { position:absolute; right:0; bottom:-2px; margin:0!important; padding:9px 14px; border:1px solid #526a80; border-radius:7px; background:#172c40; color:#c8d8e6; font-size:16px; opacity:0; transform:translateY(7px); transition:opacity .3s,transform .3s; }
.semantics-conclusion.visible { opacity:1; transform:none; }.semantics-conclusion strong { color:var(--command); font-weight:600; }
</style>
