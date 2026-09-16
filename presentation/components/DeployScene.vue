<script setup lang="ts">
defineProps<{ step: number }>()
</script>

<template>
  <section class="deploy-scene">
    <div class="deploy-stage">
      <article class="deploy-audit" :class="{ focused: step === 1 }">
        <span class="label">SITE GERADO</span>
        <carbon-logo-python class="deploy-python" aria-hidden="true" />
        <h2>Auditoria em Python</h2>
        <code>dist/</code>
        <p>Verifica páginas, recursos e índices antes da publicação.</p>
      </article>

      <span class="deploy-arrow" aria-hidden="true">→</span>

      <div class="deploy-gate" :class="{ focused: step >= 1 }">
        <span>PASSOU?</span>
      </div>

      <div class="deploy-branch-arrows" aria-hidden="true"><span>↗</span><span>↘</span></div>

      <div class="deploy-outcomes">
        <article class="deploy-failure" :class="{ focused: step === 2 }">
          <span class="label">SE FALHAR</span>
          <h2>Interrompe o deploy</h2>
          <p>Mantém o catálogo atual.</p>
        </article>

        <article class="deploy-success" :class="{ focused: step === 3 }">
          <span class="label">SE PASSAR</span>
          <div class="publish-flow">
            <div><strong>S3 privado</strong><small>Hospeda o <code>dist/</code></small></div>
            <b>→</b>
            <div><strong>CloudFront</strong><small>Basic Auth</small></div>
            <b>→</b>
            <div><strong>Usuário</strong><small>Catálogo atualizado</small></div>
          </div>
        </article>
      </div>
    </div>

    <p class="story-takeaway">Um catálogo inválido nunca substitui a versão publicada.</p>
  </section>
</template>
