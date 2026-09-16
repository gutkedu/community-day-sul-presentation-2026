<script setup lang="ts">
defineProps<{ step: number }>()
</script>

<template>
  <section class="specs-overview">
    <article class="spec-panel openapi" :class="{ active: step === 1 }">
      <header><img src="/brands/openapi.png" alt="" /><div><span>APIs HTTP</span><h2>OpenAPI</h2></div></header>
      <h3 class="spec-summary">Operações HTTP</h3>
      <div class="spec-details" :class="{ revealed: step >= 1 }">
        <p>Paths, métodos, requisições e respostas</p>
        <div class="history-line" aria-label="História do OpenAPI">
          <div class="history-item"><strong>2010</strong><span>Tony Tam cria o Swagger</span></div>
          <div class="history-item"><strong>2015</strong><span>OpenAPI Initiative · Linux Foundation</span></div>
        </div>
      </div>
    </article>

    <div class="spec-divider" aria-hidden="true">+</div>

    <article class="spec-panel asyncapi" :class="{ active: step === 2 }">
      <header><img src="/brands/asyncapi.png" alt="" /><div><span>APIs ASSÍNCRONAS</span><h2>AsyncAPI</h2></div></header>
      <h3 class="spec-summary">Mensagens e canais</h3>
      <div class="spec-details" :class="{ revealed: step >= 2 }">
        <p>Canais, mensagens, envio e recebimento</p>
        <div class="history-line" aria-label="História do AsyncAPI">
          <div class="history-item"><strong>2016</strong><span>Fran Méndez cria o AsyncAPI</span></div>
          <div class="history-item"><strong>2021</strong><span>Projeto da Linux Foundation</span></div>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.specs-overview { height:410px; display:grid; grid-template-columns:1fr 70px 1fr; align-items:stretch; gap:18px; }
.spec-panel { border:1px solid #314b64; border-radius:18px; background:#0f2033; padding:28px 30px; transition:border-color .35s,background .35s; }
.spec-panel.active { border-color:var(--accent); background:#152a40; }
.spec-panel header { display:flex; align-items:center; gap:20px; border-bottom:1px solid #30475e; padding-bottom:22px; }
.spec-panel img { width:68px; height:68px; object-fit:contain; }
.spec-panel header span { color:#9fb5c9; font:12px 'Roboto Mono'; letter-spacing:1.3px; }
.spec-panel h2 { font-size:34px; margin:7px 0 0; }
.spec-details { opacity:0; transform:translateY(12px); visibility:hidden; transition:opacity .35s,transform .35s,visibility 0s linear .35s; }
.spec-details.revealed { opacity:1; transform:none; visibility:visible; transition-delay:0s; }
.spec-summary { font-size:25px; margin:27px 0 20px; color:#ecf3f8; }
.spec-details p { color:#c1d0de; font-size:19px; margin:11px 0; }
.spec-details p::before { content:'—'; color:var(--accent); margin-right:10px; }
.history-line { display:grid; gap:10px; border-top:1px solid #30475e; margin-top:18px; padding-top:17px; }
.history-item { display:grid; grid-template-columns:58px 1fr; align-items:center; gap:10px; color:#9eb1c2; font-size:14px; }
.history-item strong { color:var(--accent); font:700 14px 'Roboto Mono'; letter-spacing:.5px; }
.history-item span { line-height:1.25; }
.spec-divider { align-self:center; color:#6f879c; font:36px 'Roboto Mono'; text-align:center; }
.openapi { --accent:#35a9e0; }
.asyncapi { --accent:#ef8b3a; }
</style>
