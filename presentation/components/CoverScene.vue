<script setup lang="ts">
import { computed } from 'vue'
import { useIsSlideActive, useNav, useSlideContext } from '@slidev/client'
import { DECK_TITLE, SLIDE_COUNT } from '../lib/deck'

const isActive = useIsSlideActive()
const nav = useNav()
const { $renderContext } = useSlideContext()
const live = computed(() => isActive.value && !nav.isPrintMode.value
  && ['slide', 'presenter'].includes($renderContext.value))

const connections = [
  { id: 'command', d: 'M104 149V194Q104 210 120 210H168', color: 'var(--command)', delay: '0.2s' },
  { id: 'event', d: 'M168 270H58Q42 270 42 286V358Q42 374 58 374H64', color: 'var(--event)', delay: '2s' },
  { id: 'consumer-a', d: 'M276 374H328Q338 374 348 371H389', color: 'var(--event)', delay: '3.8s' },
  { id: 'consumer-b', d: 'M276 374H322Q338 374 338 390V457Q338 473 354 473H389', color: 'var(--event)', delay: '3.8s' },
]
</script>

<template>
  <div class="cover-scene">
    <div class="cover-copy">
      <div class="eyebrow"><span class="chapter-number">EDA</span> UMA JORNADA VISUAL</div>
      <h1 :aria-label="DECK_TITLE">De rotas HTTP<br>a <span>eventos:</span></h1>
      <p class="talk-subtitle">uma jornada prática<br>para pensar EDA</p>
      <div class="cover-topics">OPENAPI · ASYNCAPI · AWS · EVENTCATALOG</div>
      <div class="cover-author"><strong>Eduardo Pedó Gutkoski</strong></div>
    </div>
    <div class="cover-art" aria-label="Command chega a um serviço, que publica um Event para dois consumidores">
      <div class="art-grid" />
      <svg viewBox="0 0 560 550" class="cover-wires" aria-hidden="true">
        <g class="connection-tracks">
          <path v-for="connection in connections" :key="connection.id" :d="connection.d" :stroke="connection.color" />
        </g>
        <g v-if="live" class="connection-pulses">
          <path v-for="connection in connections" :key="connection.id" :d="connection.d" pathLength="100"
            :style="{ stroke: connection.color, animationDelay: connection.delay }" />
        </g>
      </svg>
      <div class="cover-command"><span class="label command">COMMAND</span><code>Solicitar mudança</code></div>
      <div class="cover-service"><span class="label">SERVIÇO</span><strong>Domínio</strong><span class="service-check">✓</span></div>
      <div class="cover-event"><span class="label event">EVENT</span><code>Fato ocorrido</code></div>
      <div class="cover-consumer first">Consumidor A <span>↗</span></div>
      <div class="cover-consumer second">Consumidor B <span>↗</span></div>
    </div>
    <footer class="cover-footer"><span>AWS COMMUNITY DAY SUL 2026</span><span><b>01 / {{ SLIDE_COUNT }}</b></span></footer>
  </div>
</template>

<style scoped>
.cover-wires { stroke-linecap:round; stroke-linejoin:round; }
.connection-tracks { opacity:.48; }
.connection-pulses path {
  stroke-width:4;
  stroke-dasharray:12 110;
  stroke-dashoffset:12;
  opacity:0;
  animation:cover-connection-pulse 7.2s linear infinite;
}
@keyframes cover-connection-pulse {
  0% { stroke-dashoffset:12; opacity:0; }
  4% { stroke-dashoffset:12; opacity:1; }
  28% { stroke-dashoffset:-100; opacity:1; }
  29%, 100% { stroke-dashoffset:-100; opacity:0; }
}
@media (prefers-reduced-motion:reduce) {
  .connection-pulses { display:none; }
}
@media print {
  .connection-pulses { display:none; }
}
</style>
