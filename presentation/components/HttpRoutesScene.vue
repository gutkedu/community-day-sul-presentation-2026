<template>
  <section class="http-routes-scene">
    <div class="http-route-list"><div v-for="(route, i) in ['/orders/{orderId}', '/orders', '/orders/{orderId}/cancel']" :key="route"><span class="verb" :class="i === 0 ? 'query' : 'command'">{{ i === 0 ? 'GET' : 'POST' }}</span><code>{{ route }}</code></div></div>
    <aside><span class="http-question">?</span><p>O que essa operação faz?</p><p>Quem decide?</p><p>Quem precisa reagir?</p></aside>
  </section>
</template>
