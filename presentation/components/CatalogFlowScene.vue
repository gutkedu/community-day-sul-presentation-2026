<script setup lang="ts">
defineProps<{ step: number }>()
</script>
<template>
  <section class="catalog-scene catalog-flow-scene">
    <div class="catalog-toolbar"><span class="status-led" />EVENTCATALOG<span class="catalog-route">CreateOrder → decisão → OrderCreated</span><span class="catalog-view">Captura local</span></div>
    <div class="catalog-viewport" :class="`flow-capture-step-${step}`"><img src="/catalog/create-order-flow.png" alt="Captura real: CreateOrder passa pela decisão Pedido aceito; no caminho sim, OrderCreated é comunicado a Inventory e Notifications."/><div class="catalog-zoom-badge">{{ ['VISÃO GERAL', 'INTENÇÃO + DECISÃO', 'FATO + REAÇÕES'][step] }}</div></div>
    <div class="catalog-answer"><span class="label">{{ ['O FLUXO', 'ANTES DO FATO', 'DEPOIS DO FATO'][step] }}</span><p>{{ ['Uma operação, suas decisões e seus efeitos.', 'CreateOrder ainda precisa passar pela decisão.', 'OrderCreated conecta o fato aos consumidores.'][step] }}</p></div>
    <p class="capture-color-note">A captura conserva as cores do catálogo original.</p>
  </section>
</template>
