<script setup lang="ts">
import { computed } from 'vue'
import { ordersInterfacesVisibility } from '../lib/orders-interfaces'

const props = defineProps<{ step: number }>()
const focus = computed(() => Math.min(2, Math.max(0, props.step)))
const visible = computed(() => ordersInterfacesVisibility(props.step))
const captions = [
  'Orders combina operações HTTP e mensagens assíncronas.',
  'OpenAPI registra as operações HTTP que o cliente pode chamar.',
  'AsyncAPI registra o Command na fila e o Event no barramento.',
]
</script>

<template>
  <section class="orders-interfaces" :data-interface-step="focus">
    <div class="interfaces-map">
      <svg viewBox="0 0 1152 322" aria-hidden="true">
        <path class="query-wire progressive-item" :class="{ revealed: visible.http, selected: focus === 1 }" d="M166 126H414m-12-6 12 6-12 6" />
        <path class="command-wire progressive-item" :class="{ revealed: visible.http, selected: focus === 1 }" d="M166 218H414m-12-6 12 6-12 6" />
        <path class="async-command-wire progressive-item" :class="{ revealed: visible.messages, selected: focus === 2 }" d="M724 116H938m-12-6 12 6-12 6" />
        <path class="event-wire progressive-item" :class="{ revealed: visible.messages, selected: focus === 2 }" d="M724 242H938m-12-6 12 6-12 6" />
      </svg>

      <article class="interface-client"><span class="label">QUEM CHAMA</span><h2>Cliente</h2><p>Consulta ou solicita</p></article>
      <span class="interface-label http-label progressive-item" :class="{ revealed: visible.http, selected: focus === 1 }">INTERFACE HTTP</span>
      <span class="query-call progressive-item" :class="{ revealed: visible.http }">consultar pedido</span>
      <span class="command-call progressive-item" :class="{ revealed: visible.http }">solicitar criação</span>

      <article class="interface-orders" :class="{ selected: focus === 1 || focus === 2 }">
        <span class="label">SERVIÇO</span><h2>Orders</h2>
        <div class="interface-operation query progressive-item" :class="{ revealed: visible.http }"><code>GetOrderById</code><span>GET /orders/{orderId}</span></div>
        <div class="interface-operation command progressive-item" :class="{ revealed: visible.http }"><code>CreateOrder</code><span>POST /orders</span></div>
      </article>

      <div class="interface-message reserve-message progressive-item" :class="{ revealed: visible.messages, selected: focus === 2 }">
        <span class="interface-label">SQS · COMMAND</span><code>ReserveInventory</code>
      </div>
      <article class="interface-consumer inventory-consumer progressive-item" :class="{ revealed: visible.messages, selected: focus === 2 }"><span class="label">QUEM RECEBE</span><h3>Inventory</h3></article>

      <div class="interface-message event-message progressive-item" :class="{ revealed: visible.messages, selected: focus === 2 }">
        <span class="interface-label">EVENTBRIDGE · EVENT</span><code>OrderCreated</code>
      </div>
      <article class="interface-consumer notifications-consumer progressive-item" :class="{ revealed: visible.messages, selected: focus === 2 }"><span class="label">QUEM RECEBE</span><h3>Notifications</h3></article>
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
.progressive-item.revealed { opacity:.45; transform:none; visibility:visible; transition-delay:0s; }.progressive-item.revealed.selected { opacity:1; }
.query-wire { stroke:var(--query); }.command-wire,.async-command-wire { stroke:var(--command); }.event-wire { stroke:var(--event); }
.interfaces-map path.selected { opacity:1; }
.interfaces-map article { position:absolute; border:1px solid #405870; border-radius:13px; background:#102135; padding:22px; transition:background .35s,border-color .35s; }
.interfaces-map article.selected { border-color:#b5cbdc; background:#1b3044; }
.interfaces-map .label { font-size:10px; letter-spacing:1.1px; color:#adc1d4; }
.interfaces-map h2 { margin:13px 0 0; font-size:30px; font-weight:500; }.interfaces-map h3 { margin:13px 0 0; font-size:23px; font-weight:500; }
.interface-client { left:0; top:96px; width:166px; height:155px; }.interface-client p { margin-top:18px; color:#b6cadd; font-size:13px; }
.interface-orders { left:414px; top:21px; width:310px; height:292px; }
.interface-operation { margin-top:17px; padding-top:12px; border-top:1px solid #344b62; }.interface-operation code { display:block; font-size:21px; }.interface-operation span { display:block; margin-top:8px; color:#b6cadd; font:13px 'Roboto Mono'; }
.interface-label { color:#9fb4c8; font-size:10px; letter-spacing:1px; }.http-label { position:absolute; left:184px; top:43px; width:212px; text-align:center; }.http-label.selected { color:#e3edf4; }
.query-call,.command-call { position:absolute; left:173px; width:234px; text-align:center; font-size:15px; }.query-call { top:95px; color:var(--query); }.command-call { top:187px; color:var(--command); }
.interface-message { position:absolute; left:744px; width:178px; padding:10px 12px; border-left:2px solid currentColor; background:#102135; }.interface-message code { display:block; margin-top:7px; font-size:15px; }.reserve-message { top:74px; color:var(--command); }.event-message { top:201px; color:var(--event); }
.interface-consumer { left:938px; width:214px; height:103px; }.inventory-consumer { top:64px; }.notifications-consumer { top:190px; }.interfaces-map .inventory-consumer.selected { border-color:var(--command); }.interfaces-map .notifications-consumer.selected { border-color:var(--event); }
.interfaces-caption { margin:23px 0 0!important; padding:13px 18px; border-left:3px solid var(--event); background:#112337; font-size:22px; line-height:1.4; }
</style>
