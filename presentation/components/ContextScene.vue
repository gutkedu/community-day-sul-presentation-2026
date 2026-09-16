<script setup lang="ts">
import { computed } from 'vue'
import { openingAt } from '../lib/opening'
const props = defineProps<{ step: number; kind: 'system' | 'questions' | 'trace' }>()
const stages = ['Solicitação', 'Decisão', 'Fato', 'Reações']
const descriptions = ['Alguém pede uma ação.', 'Um serviço avalia e executa.', 'A mudança vira um fato.', 'Outros serviços fazem sua parte.']
const state = computed(() => openingAt(props.kind, props.step))
const step = computed(() => state.value.step)
const active = computed(() => props.kind === 'trace' ? step.value : 0)
</script>
<template>
  <section class="opening-story" :class="[`opening-${kind}`, { 'pieces-found': kind === 'system' && step >= 1 }]">
    <div class="opening-map">
      <svg viewBox="0 0 780 410" aria-hidden="true">
        <defs><marker id="opening-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="context-stroke" /></marker></defs>
        <g class="opening-background"><path d="M285 160V48H430M285 250V320M550 48H705V92" /></g>
        <path :class="{ 'intent-edge': active >= 1, 'question-edge': kind === 'questions' && step >= 1 }" d="M112 205H210" marker-end="url(#opening-arrow)" />
        <path :class="{ 'fact-edge': active >= 3, 'question-edge': kind === 'questions' && step >= 1 }" d="M360 205H430" marker-end="url(#opening-arrow)" />
        <path :class="{ 'fact-edge': active >= 4, 'question-edge': kind === 'questions' && step >= 2 }" d="M545 205H585V139H625" marker-end="url(#opening-arrow)" />
        <path :class="{ 'fact-edge': active >= 4, 'question-edge': kind === 'questions' && step >= 2 }" d="M585 205V295H625" marker-end="url(#opening-arrow)" />
      </svg>
      <div class="opening-node opening-extra extra-service opening-background"><span>Outro serviço</span></div>
      <div class="opening-node opening-extra extra-function opening-background"><span>Outra função</span></div>
      <div class="opening-node opening-client" :class="{ 'intent-node': active >= 1 }"><span class="opening-role" :class="{ shown: active >= 1 }">SOLICITAÇÃO</span><strong>Cliente</strong></div>
      <div class="opening-node opening-owner" :class="{ 'decision-highlight': active >= 2 }"><span class="opening-role" :class="{ shown: active >= 2 }">DECISÃO</span><strong>Serviço A</strong></div>
      <div class="opening-node opening-fact" :class="{ 'fact-node': active >= 3 }"><span class="opening-role" :class="{ shown: active >= 3 }">FATO</span><strong>Evento</strong></div>
      <div v-for="(name, i) in ['Serviço B', 'Serviço C']" :key="name" class="opening-node opening-consumer" :class="{ 'reaction-highlight': active >= 4 }" :style="{ top: `${92 + i * 156}px` }"><span class="opening-role" :class="{ shown: active >= 4 }">REAÇÃO</span><strong>{{ name }}</strong></div>
      <span v-if="kind === 'questions' && step >= 1" class="opening-question question-intent">?</span>
      <span v-if="kind === 'questions' && step >= 1" class="opening-question question-fact">?</span>
      <span v-if="kind === 'questions' && step >= 2" class="opening-question question-owner">?</span>
      <span v-if="kind === 'questions' && step >= 2" class="opening-question question-reaction">?</span>
    </div>
    <aside class="opening-copy">
      <template v-if="kind === 'system'">
        <span class="label">UM PROJETO EM ANDAMENTO</span><h2>Serviços.<br>Funções.<br>Eventos.</h2><p>O desenho mostrava as conexões.</p><div class="opening-insight" :class="{ visible: step >= 1 }">Eu conseguia<br>localizar as peças.</div>
      </template>
      <template v-else-if="kind === 'questions'">
        <span class="label">O QUE A SETA NÃO ME DIZIA</span>
        <h2>{{ state.question }}</h2>
        <p>{{ state.explanation }}</p>
        <div class="opening-question-progress"><span v-for="n in 2" :key="n" :class="{ selected: step === n }">{{ n === 1 ? 'Significado' : 'Responsabilidade' }}</span></div>
      </template>
      <template v-else>
        <span class="label">SEGUIR UM CAMINHO</span>
        <ol class="opening-stages"><li v-for="(label, i) in stages" :key="label" :class="{ current: step === i + 1, reached: step >= i + 1 }"><span>{{ i + 1 }}</span><div><strong>{{ label }}</strong><p>{{ descriptions[i] }}</p></div></li></ol>
      </template>
    </aside>
  </section>
</template>
