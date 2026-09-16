<script setup lang="ts">
defineProps<{ step: number }>()
const labels = ['O fluxo documentado', 'Quem publica o fato?', 'Quem precisa reagir?']
</script>
<template>
  <section class="catalog-scene">
    <div class="catalog-toolbar"><span class="status-led" />EVENTCATALOG<span class="catalog-route">/ events / OrderCreated / 1.0.0</span><span class="catalog-view">{{ labels[step] }}</span></div>
    <div class="catalog-viewport" :class="`catalog-step-${step}`"><img src="/catalog/order-created-map.png" alt="Captura real do EventCatalog: Orders Service publica OrderCreated, roteado por Application Events para Inventory Service e Notifications Service." /><div class="catalog-zoom-badge">{{ step === 0 ? 'VISÃO GERAL' : step === 1 ? 'AMPLIAÇÃO · PRODUTOR + EVENTO' : 'AMPLIAÇÃO · CONSUMIDORES' }}</div></div>
    <div class="catalog-answer"><span class="label">{{ step === 0 ? 'DA PERGUNTA À RESPOSTA' : step === 1 ? 'QUEM PUBLICA' : 'QUEM CONSOME' }}</span><p>{{ step === 0 ? 'Uma relação que podemos consultar.' : step === 1 ? 'Orders publica OrderCreated.' : 'Inventory e Notifications reagem ao fato.' }}</p></div>
  </section>
</template>
