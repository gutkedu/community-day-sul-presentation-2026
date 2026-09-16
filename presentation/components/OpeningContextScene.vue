<script setup lang="ts">
defineProps<{ kind: 'system' | 'questions' }>()
</script>

<template>
  <section class="opening-context" :class="{ 'connection-focus': kind === 'questions' }">
    <svg viewBox="0 0 1152 418" class="opening-connections" aria-hidden="true">
      <path class="first-connection" d="M326 204H456m-14-7 14 7-14 7" />
      <path class="second-connection" d="M696 204H826m-14-7 14 7-14 7" />
      <g v-if="kind === 'questions'" class="connection-question"><circle cx="391" cy="204" r="25"/><text x="391" y="213">?</text></g>
    </svg>
    <article v-for="(name, i) in ['Domínio A', 'Domínio B', 'Domínio C']" :key="name" class="context-service" :class="{ 'context-other': i === 2 }" :style="{ left: `${86 + i * 370}px` }"><h2>{{ name }}</h2></article>
  </section>
</template>

<style scoped>
.opening-context { position:relative; height:418px; }
.opening-connections { position:absolute; inset:0; width:1152px; height:418px; fill:none; stroke:#7c98b2; stroke-width:2; }
.context-service { position:absolute; top:119px; width:240px; height:170px; display:flex; align-items:center; justify-content:center; border:1px solid #6e8ba5; border-radius:16px; background:#112438; }
.context-service h2 { margin:0; font-size:34px; font-weight:500; color:var(--text); }
.connection-focus .first-connection { stroke:var(--event); stroke-width:3; }
.connection-focus .context-service:not(.context-other) { border-color:var(--event); background:#1b2c3b; }
.connection-focus .context-other,.connection-focus .second-connection { opacity:.22; }
.connection-question circle { fill:var(--bg); stroke:var(--event); stroke-width:2; }
.connection-question text { fill:var(--event); stroke:none; text-anchor:middle; font:28px Inter; }
</style>
