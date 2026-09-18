<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ step: number }>()

const currentStep = computed(() => Math.min(Math.max(props.step, 0), 3))

const lines = [
  ['{', 0],
  ['  "source": "orders",', 1],
  ['  "detail-type": "orders.order-created.v1",', 1],
  ['  "detail": {', 0],
  ['    "metadata": {', 2],
  ['      "eventId": "evt-123",', 2],
  ['      "eventVersion": 1,', 2],
  ['      "occurredAt": "2026-09-17T14:00:00Z",', 2],
  ['      "correlationId": "corr-789"', 2],
  ['    },', 2],
  ['    "data": {', 3],
  ['      "orderId": "ord-123",', 3],
  ['      "total": 129.90', 3],
  ['    }', 3],
  ['  }', 0],
  ['}', 0],
] as const

const explanations = [
  {
    label: 'ENVELOPE COMPARTILHADO',
    title: 'Um formato previsível para todos os eventos',
    body: 'O envelope separa roteamento, contexto operacional e conteúdo de negócio.',
  },
  {
    label: '01 / ROTEAMENTO',
    title: 'Quem publicou e o que aconteceu?',
    body: 'source identifica o domínio produtor. detail-type usa o mesmo nome versionado do contrato AsyncAPI.',
  },
  {
    label: '02 / METADATA',
    title: 'Como identificar e rastrear o evento?',
    body: 'Identidade, versão, instante e correlação apoiam idempotência, observabilidade e diagnóstico.',
  },
  {
    label: '03 / DATA',
    title: 'Quais dados de negócio foram comunicados?',
    body: 'Os consumidores tomam decisões a partir de data, sem depender de campos de negócio duplicados no envelope.',
  },
]

const copy = computed(() => explanations[currentStep.value])
</script>

<template>
  <section class="event-payload-scene">
    <div class="event-payload-code">
      <div class="event-payload-toolbar">
        <span class="event-payload-dot" />
        <code>EventBridge event</code>
        <span>JSON · RECORTE</span>
      </div>
      <div class="event-payload-lines" :class="{ focused: currentStep > 0 }">
        <div
          v-for="([text, group], index) in lines"
          :key="index"
          class="event-payload-line"
          :class="{
            selected: currentStep > 0 && group === currentStep,
            structural: group === 0,
          }"
        >
          <span>{{ index + 1 }}</span>
          <code>{{ text }}</code>
        </div>
      </div>
    </div>

    <aside class="event-payload-copy">
      <span class="label">{{ copy.label }}</span>
      <h2>{{ copy.title }}</h2>
      <p>{{ copy.body }}</p>

      <div class="event-payload-legend">
        <div :class="{ active: currentStep === 1 }">
          <b>source + detail-type</b>
          <span>roteamento</span>
        </div>
        <div :class="{ active: currentStep === 2 }">
          <b>detail.metadata</b>
          <span>contexto técnico</span>
        </div>
        <div :class="{ active: currentStep === 3 }">
          <b>detail.data</b>
          <span>dados de negócio</span>
        </div>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.event-payload-scene {
  display: grid;
  grid-template-columns: 690px 1fr;
  gap: 40px;
  align-items: start;
}

.event-payload-code {
  overflow: hidden;
  border: 1px solid #3c5269;
  border-radius: 12px;
  background: #0d1b2b;
}

.event-payload-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 17px;
  border-bottom: 1px solid #2b4057;
  background: #142439;
  color: #9fb1c3;
  font-size: 11px;
}

.event-payload-toolbar > span:last-child {
  margin-left: auto;
  font-size: 10px;
  letter-spacing: 1px;
}

.event-payload-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--event);
}

.event-payload-lines {
  padding: 10px 0;
}

.event-payload-line {
  display: flex;
  align-items: center;
  min-height: 24px;
  padding: 0 14px;
  border-left: 3px solid transparent;
  transition: opacity .3s, background .3s, border-color .3s;
}

.event-payload-line > span {
  width: 30px;
  flex: 0 0 30px;
  color: #71879d;
  font: 10px 'Roboto Mono';
}

.event-payload-line code {
  color: #dce8f3;
  font-size: 15px;
  line-height: 1;
  white-space: pre;
}

.event-payload-lines.focused .event-payload-line:not(.selected):not(.structural) {
  opacity: .28;
}

.event-payload-lines.focused .event-payload-line.structural {
  opacity: .55;
}

.event-payload-line.selected {
  border-left-color: var(--event);
  background: #ff9e5214;
}

.event-payload-copy {
  padding-top: 12px;
}

.event-payload-copy > .label {
  color: var(--event);
  font-size: 11px;
}

.event-payload-copy h2 {
  margin: 18px 0;
  font-size: 31px;
  font-weight: 500;
  line-height: 1.18;
  letter-spacing: -.8px;
}

.event-payload-copy > p {
  color: #adbed0;
  font-size: 18px;
  line-height: 1.5;
}

.event-payload-legend {
  display: grid;
  gap: 9px;
  margin-top: 24px;
}

.event-payload-legend > div {
  padding: 11px 13px;
  border: 1px solid #344b62;
  border-left: 3px solid #557087;
  border-radius: 7px;
  background: #101f30;
  opacity: .62;
  transition: opacity .3s, border-color .3s, background .3s;
}

.event-payload-legend > div.active {
  border-color: var(--event);
  background: #30241c;
  opacity: 1;
}

.event-payload-legend b,
.event-payload-legend span {
  display: block;
}

.event-payload-legend b {
  color: #e2edf6;
  font: 13px 'Roboto Mono';
}

.event-payload-legend span {
  margin-top: 4px;
  color: #aebfd0;
  font-size: 12px;
}
</style>
