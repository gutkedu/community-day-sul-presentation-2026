<script setup lang="ts">
import { SLIDE_COUNT } from '../lib/deck'
defineProps<{ index: number }>()
</script>

<template>
  <main class="conclusion-scene" :data-slide="index" aria-label="Das três dúvidas ao entendimento da arquitetura">
    <div class="eyebrow"><span class="chapter-number">{{ String(index).padStart(2, '0') }}</span>CONCLUSÃO</div>

    <header class="conclusion-gain">
      <p class="label">O GANHO DESSA JORNADA</p>
      <h1>
        <span>Acompanhar a arquitetura</span>
        <span class="conclusion-emphasis">enquanto ela evoluía.</span>
      </h1>
    </header>

    <ol class="conclusion-journey" aria-label="Das dúvidas aos contratos e ao catálogo">
      <li class="conclusion-doubts">
        <span class="label">O PONTO DE PARTIDA</span>
        <h2>Três dúvidas</h2>
        <p>Significado · Responsabilidades<br>Registro</p>
      </li>
      <li>
        <span class="label">O QUE TORNAMOS EXPLÍCITO</span>
        <h2>Contratos</h2>
        <p>Conhecimento explícito.</p>
      </li>
      <li class="conclusion-catalog">
        <span class="label">O QUE PASSAMOS A ENXERGAR</span>
        <h2>Catálogo</h2>
        <p>Relações navegáveis.</p>
      </li>
    </ol>

    <footer class="deck-footer">
      <span>EDUARDO GUTKOSKI <span class="footer-separator">/</span> AWS COMMUNITY DAY SUL 2026</span>
      <span class="slide-count">{{ String(index).padStart(2, '0') }} / {{ SLIDE_COUNT }}</span>
    </footer>
  </main>
</template>

<style scoped>
.conclusion-scene {
  position: relative;
  width: 1280px;
  height: 720px;
  padding: 44px 64px 0;
  overflow: hidden;
  background: radial-gradient(ellipse at 88% 33%, #12344b66, transparent 58%), var(--bg);
}
.conclusion-gain { margin-top: 76px; }
.conclusion-gain .label { color: var(--muted); font-size: 12px; letter-spacing: 2px; }
.conclusion-gain h1 { margin-top: 20px; font-size: 66px; line-height: 1.14; letter-spacing: -2.6px; font-weight: 600; }
.conclusion-gain h1 span { display: block; }
.conclusion-emphasis { color: var(--event); }
.conclusion-journey { display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 48px; list-style: none; margin: 65px 0 0; padding: 0; }
.conclusion-journey li { position: relative; margin: 0; border-top: 1px solid #425267; padding-top: 27px; }
.conclusion-journey li:not(:last-child)::after { content: '→'; position: absolute; top: -16px; right: -36px; font-size: 23px; color: var(--muted); }
.conclusion-journey .label { font-size: 10px; letter-spacing: 1.25px; }
.conclusion-journey h2 { margin-top: 13px; font-size: 30px; line-height: 1.2; font-weight: 500; letter-spacing: -.7px; }
.conclusion-journey p { margin-top: 13px; font-size: 21px; line-height: 1.55; color: #bbcbd9; }
.conclusion-doubts p { font-size: 18px; }
.conclusion-catalog { border-color: #ff9e5277!important; }
.conclusion-catalog .label { color: var(--event); }
</style>
