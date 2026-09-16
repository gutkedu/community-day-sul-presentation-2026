<script setup lang="ts">
import { SLIDE_COUNT } from '../lib/deck'
defineProps<{ index: number; eyebrow: string; title: string; subtitle?: string; step: number; total: number }>()
</script>

<template>
  <main class="deck-frame" :data-slide="index" :data-step="step">
    <header class="deck-header">
      <div class="eyebrow"><span class="chapter-number">{{ String(index).padStart(2, '0') }}</span>{{ eyebrow }}</div>
      <h1 :class="{ 'long-title': title.length > 58 }">{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </header>
    <div class="deck-content"><slot /></div>
    <footer class="deck-footer">
      <span>EDUARDO GUTKOSKI <span class="footer-separator">/</span> AWS COMMUNITY DAY SUL 2026</span>
      <div class="progress" :aria-label="`Etapa ${Math.min(step, total)} de ${total}`">
        <span v-for="n in total + 1" :key="n" class="progress-dot" :class="{ active: n - 1 === step, past: n - 1 < step }" />
        <span class="slide-count">{{ String(index).padStart(2, '0') }} / {{ SLIDE_COUNT }}</span>
      </div>
    </footer>
  </main>
</template>
