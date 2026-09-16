<script setup lang="ts">
defineProps<{ step: number }>()
const routes = [
  { verb: 'GET', path: '/orders/{orderId}', text: 'Consultar um pedido' },
  { verb: 'POST', path: '/orders', text: 'Solicitar a criação' },
  { verb: 'POST', path: '/orders/{orderId}/cancel', text: 'Solicitar o cancelamento' },
]
</script>
<template>
  <div class="routes-scene purpose-routes">
    <div class="route-labels"><span>O QUE A API EXPÕE</span><span>O QUE O CLIENTE QUER</span></div>
    <div v-for="(route, i) in routes" :key="route.path" class="route-row">
      <div class="route-source"><span class="verb">{{ route.verb }}</span><code>{{ route.path }}</code></div>
      <div class="route-arrow" :class="{ revealed: step > i }">⟶</div>
      <div class="route-intent" :class="{ revealed: step > i }" :aria-hidden="step <= i"><strong>{{ route.text }}</strong></div>
    </div>
    <p class="scene-takeaway">{{ step === 0 ? 'Por trás de cada rota, existe um propósito.' : step === 1 ? 'Consultar: buscar uma informação.' : 'Criar e cancelar: pedir uma mudança.' }}</p>
  </div>
</template>
