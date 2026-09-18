<script setup lang="ts">
import { SLIDE_COUNT } from '../lib/deck'
defineProps<{ index: number }>()
</script>

<template>
  <main class="promise-scene" :data-slide="index">
    <span class="eyebrow">A PROPOSTA DA PALESTRA</span>
    <h1>
      <span class="promise-opening">Vou mostrar como saí dessas dúvidas</span>
      <span class="promise-core">para uma documentação que nos ajudava a <strong>acompanhar a arquitetura</strong></span>
      <span class="promise-ending">enquanto o sistema evoluía.</span>
    </h1>
    <footer class="cover-footer">
      <span>AWS COMMUNITY DAY SUL 2026</span>
      <span>{{ String(index).padStart(2, '0') }} / {{ SLIDE_COUNT }}</span>
    </footer>
  </main>
</template>

<style scoped>
.promise-scene {
  position: relative;
  width: 1280px;
  height: 720px;
  padding: 116px 72px 100px;
  background: radial-gradient(ellipse at 90% 25%, #12344b66, transparent 60%), var(--bg);
}
.promise-scene h1 { max-width: 1110px; margin: 42px 0 0; font-weight: 500; }
.promise-opening { display: block; color: var(--muted); font-size: 34px; line-height: 1.3; letter-spacing: -1px; }
.promise-core { display: block; margin-top: 24px; font-size: 55px; line-height: 1.2; letter-spacing: -2px; text-wrap: balance; }
.promise-core strong { color: var(--event); font-weight: 600; }
.promise-ending { display: block; margin-top: 24px; font-size: 37px; line-height: 1.3; letter-spacing: -1px; }
</style>
