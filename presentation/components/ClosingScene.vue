<script setup lang="ts">
import { SLIDE_COUNT } from '../lib/deck'
defineProps<{ kind: 'section' | 'closing'; index: number }>()
</script>
<template>
  <div class="closing-scene">
    <div class="closing-decoration" aria-hidden="true"><span>Query</span><span>Command</span><span>Event</span></div>
    <span class="eyebrow">{{ kind === 'section' ? 'DA IDEIA À PRÁTICA' : 'PARA LEVAR COM VOCÊ' }}</span>
    <h1>{{ kind === 'section' ? 'Como apliquei isso' : 'Comece por um fluxo' }}<br><span>{{ kind === 'section' ? 'no trabalho' : 'do seu sistema' }}</span></h1>
    <p>{{ kind === 'section' ? 'Contratos por domínio e geração na pipeline' : 'Nem tudo precisa virar evento.' }}</p>
    <div v-if="kind === 'closing'" class="closing-contact"><strong>Eduardo Pedó Gutkoski</strong><a href="https://www.linkedin.com/in/eduardogutkoski/" target="_blank" rel="noopener">linkedin.com/in/eduardogutkoski ↗</a></div>
    <footer class="cover-footer"><span>AWS COMMUNITY DAY SUL 2026</span><span>{{ index }} / {{ SLIDE_COUNT }}</span></footer>
  </div>
</template>
