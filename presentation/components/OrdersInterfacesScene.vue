<script setup lang="ts">
import { computed } from 'vue'
import { ordersInterfacesVisibility } from '../lib/orders-interfaces'
const props = defineProps<{ step: number }>()
const focus = computed(() => Math.min(2, Math.max(0, props.step)))
const visible = computed(() => ordersInterfacesVisibility(props.step))
const captions = [
  'Duas interfaces do mesmo serviço: operações HTTP e mensagens.',
  'OpenAPI registra as operações HTTP que o cliente pode chamar.',
  'AsyncAPI registra as mensagens e quem as envia ou recebe.',
]
</script>

<template>
  <section class="orders-interfaces" :data-interface-step="focus">
    <div class="interfaces-map">
      <svg viewBox="0 0 1152 322" aria-hidden="true">
        <path class="query-wire progressive-item" :class="{ revealed: visible.http, selected: focus === 1 }" d="M166 132H414m-12-6 12 6-12 6" />
        <path class="command-wire progressive-item" :class="{ revealed: visible.http, selected: focus === 1 }" d="M166 223H414m-12-6 12 6-12 6" />
        <path class="event-wire progressive-item" :class="{ revealed: visible.messages, selected: focus === 2 }" d="M724 177H910V94H938m-12-6 12 6-12 6M910 177V260H938m-12-6 12 6-12 6" />
      </svg>
      <article class="interface-client"><span class="label">QUEM CHAMA</span><h2>Cliente</h2><p>Consulta ou solicita</p></article>
      <span class="interface-label http-label progressive-item" :class="{ revealed: visible.http, selected: focus === 1 }">INTERFACE HTTP</span>
      <span class="query-call progressive-item" :class="{ revealed: visible.http }">consultar pedido</span>
      <span class="command-call progressive-item" :class="{ revealed: visible.http }">solicitar criação</span>
      <article class="interface-orders" :class="{ selected: focus === 1 }">
        <span class="label">SERVIÇO</span><h2>Orders</h2>
        <div class="interface-operation query progressive-item" :class="{ revealed: visible.http }"><code>GetOrderById</code><span>GET /orders/{orderId}</span></div>
        <div class="interface-operation command progressive-item" :class="{ revealed: visible.http }"><code>CreateOrder</code><span>POST /orders</span></div>
      </article>
      <div class="interface-message progressive-item" :class="{ revealed: visible.messages, selected: focus === 2 }"><span class="interface-label">MENSAGENS</span><code>OrderCreated</code></div>
      <article v-for="(name, i) in ['Inventory', 'Notifications']" :key="name" class="interface-consumer progressive-item" :class="{ revealed: visible.messages, selected: focus === 2 }" :style="{ top: `${i * 166 + 43}px` }"><span class="label">QUEM RECEBE</span><h3>{{ name }}</h3></article>
    </div>
    <p class="interfaces-caption">{{ captions[focus] }}</p>
  </section>
</template>

<style scoped>
.orders-interfaces { height:418px; }
.interfaces-map { position:relative; height:322px; }
.interfaces-map svg { position:absolute; inset:0; width:1152px; height:322px; fill:none; stroke-width:2; }
.interfaces-map path { transition:opacity .35s,transform .35s; }
.progressive-item { opacity:0; transform:translateX(-8px); visibility:hidden; transition:opacity .35s,transform .35s,visibility 0s linear .35s; }
.progressive-item.revealed { opacity:.45; transform:none; visibility:visible; transition-delay:0s; }
.progressive-item.revealed.selected { opacity:1; }
.interfaces-map .query-wire { stroke:var(--query); }.interfaces-map .command-wire { stroke:var(--command); }.interfaces-map .event-wire { stroke:var(--event); }
.interfaces-map path.selected { opacity:1; }
.interfaces-map article { position:absolute; border:1px solid #405870; border-radius:13px; background:#102135; padding:22px; transition:background .35s,border-color .35s; }
.interfaces-map article.selected { border-color:#b5cbdc; background:#1b3044; }
.interfaces-map .label { font-size:10px; letter-spacing:1.1px; color:#adc1d4; }
.interfaces-map h2 { font-size:30px; font-weight:500; margin:13px 0 0; }.interfaces-map h3 { font-size:23px; font-weight:500; margin:13px 0 0; }
.interface-client { left:0; top:101px; width:166px; height:155px; }
.interface-client p { font-size:13px; margin-top:18px; color:#b6cadd; }
.interface-orders { left:414px; top:21px; width:310px; height:292px; }
.interface-operation { border-top:1px solid #344b62; margin-top:17px; padding-top:12px; }
.interface-operation code { display:block; font-size:21px; }.interface-operation span { display:block; font:13px 'Roboto Mono'; color:#b6cadd; margin-top:8px; }
.interface-label { font-size:11px; letter-spacing:1.2px; color:#9fb4c8; }
.http-label { position:absolute; left:184px; top:49px; width:212px; text-align:center; }.http-label.selected { color:#e3edf4; }
.query-call,.command-call { position:absolute; left:173px; width:234px; text-align:center; font-size:15px; }.query-call { top:101px; color:var(--query); }.command-call { top:192px; color:var(--command); }
.interface-message { position:absolute; top:96px; left:730px; width:172px; text-align:center; }.interface-message code { display:block; color:var(--event); font-size:19px; margin-top:9px; }.interface-message.selected .interface-label { color:var(--event); }
.interface-consumer { left:938px; width:214px; height:103px; }.interfaces-map .interface-consumer.selected { border-color:var(--event); }
.interfaces-caption { border-left:3px solid var(--event); background:#112337; font-size:22px; line-height:1.4; margin:23px 0 0!important; padding:13px 18px; }
</style>
