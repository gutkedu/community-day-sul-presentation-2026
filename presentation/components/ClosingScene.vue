<script setup lang="ts">
import { SLIDE_COUNT } from '../lib/deck'
import links from '../lib/published-links.json'
defineProps<{
  kind: 'section' | 'closing'
  index: number
}>()
</script>
<template>
  <div class="closing-scene" :class="{ 'final-closing': kind === 'closing' }">
    <template v-if="kind === 'section'">
      <div class="closing-decoration" aria-hidden="true"><span>Query</span><span>Command</span><span>Event</span></div>
      <span class="eyebrow">DA IDEIA À PRÁTICA</span>
      <h1>Como apliquei isso<br><span>no trabalho</span></h1>
      <p>Contratos por domínio e geração na pipeline</p>
    </template>
    <template v-else>
      <h1 class="closing-thanks">Obrigado!</h1>
      <div class="closing-links">
        <article v-for="link in links" :key="link.id" class="closing-link-card">
          <strong>{{ link.label }}</strong>
          <a class="closing-qr-link" :href="link.url" target="_blank" rel="noopener noreferrer" :aria-label="'Abrir ' + link.label">
            <img class="closing-qr" :src="'/qrcodes/' + link.id + '.svg'" :alt="'QR code para ' + link.label" width="184" height="184" />
          </a>
          <a class="closing-url" :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.displayUrl }}</a>
        </article>
      </div>
    </template>
    <footer class="cover-footer"><span>AWS COMMUNITY DAY SUL 2026</span><span>{{ index }} / {{ SLIDE_COUNT }}</span></footer>
  </div>
</template>
