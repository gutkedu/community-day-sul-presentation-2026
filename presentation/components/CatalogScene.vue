<script setup lang="ts">
defineProps<{ step: number }>()
const labels = ['Detalhes do evento', 'Schema do evento']
</script>
<template>
  <section class="catalog-scene catalog-resource-scene">
    <div class="catalog-toolbar">
      <span class="status-led" />EVENTCATALOG
      <span class="catalog-route">{{ step === 0 ? '/ docs / events / OrderCreated / 1.0.0' : '/ schemas / events / OrderCreated / 1.0.0' }}</span>
      <span class="catalog-view">{{ labels[step] }}</span>
    </div>
    <div class="catalog-resource-stage">
      <div class="catalog-resource-shot">
        <img
          src="/screenshots/eventcatalog-event-details-current.png"
          alt="Página real atualizada do evento OrderCreated no EventCatalog, produzido por CreateOrder e consumido por Notifications."
          :class="{ visible: step === 0 }"
        />
        <img
          src="/screenshots/eventcatalog-event-schema.png"
          alt="Página real do JSON Schema versionado do evento OrderCreated no EventCatalog."
          :class="{ visible: step === 1 }"
        />
        <div class="catalog-zoom-badge">{{ step === 0 ? 'ORDERCREATED · V1.0.0' : 'SCHEMA.JSON · V1.0.0' }}</div>
      </div>
      <aside class="catalog-resource-summary">
        <span class="label">{{ step === 0 ? 'CONTEXTO DO EVENTO' : 'CONTRATO DA MENSAGEM' }}</span>
        <h2>{{ step === 0 ? 'OrderCreated' : 'JSON Schema' }}</h2>
        <ul v-if="step === 0">
          <li><span>Produzido por</span><strong>CreateOrder · Orders</strong></li>
          <li><span>Consumido por</span><strong>OrderCreatedConsumer · Notifications</strong></li>
          <li><span>Responsável</span><strong>Orders Team</strong></li>
          <li><span>Aparece em</span><strong>Create Order Flow</strong></li>
        </ul>
        <ul v-else>
          <li><span>Formato</span><strong>JSON Schema</strong></li>
          <li><span>Versão</span><strong>1.0.0</strong></li>
          <li><span>Campos</span><strong>metadata + data</strong></li>
          <li><span>Validação</span><strong>Contrato consultável</strong></li>
        </ul>
      </aside>
    </div>
  </section>
</template>
