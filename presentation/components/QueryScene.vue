<script setup lang="ts">
defineProps<{ step: number }>()
</script>
<template>
  <section class="query-scene">
    <div class="query-flow">
      <svg class="flow-wires" viewBox="0 0 1152 280" aria-hidden="true"><path d="M255 105H447M439 99L447 105L439 111" :class="step >= 1 ? 'query-stroke' : 'muted-stroke'" /><path d="M447 183H255M263 177L255 183L263 189" :class="step >= 2 ? 'query-stroke' : 'muted-stroke'" /><path d="M714 145H851M843 139L851 145L843 151" class="muted-stroke" /></svg>
      <div class="query-client"><span class="label">CLIENTE</span><h2>Consultar</h2><code>GET /orders/ord-17</code></div>
      <div class="query-orders" :class="{ focus: step === 1 }"><span class="label">ORDERS · QUERY</span><h2>GetOrderById</h2><p>Buscar o pedido</p></div>
      <div class="query-state"><span class="label">ESTADO DE NEGÓCIO</span><h2>ord-17</h2><code>status: CREATED</code><span class="state-chip success">{{ step >= 2 ? '✓ Permanece CREATED' : 'Já estava CREATED' }}</span></div>
      <span class="query-result" :class="{ visible: step >= 2 }">200 OK</span>
    </div>
    <div class="query-response" :class="{ visible: step >= 2 }"><span class="label">RESPOSTA</span><code>{"orderId":"ord-17","status":"CREATED"}</code></div>
    <p class="story-takeaway">Consultamos o estado do pedido, sem alterá-lo.</p>
  </section>
</template>
