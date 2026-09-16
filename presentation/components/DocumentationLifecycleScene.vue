<script setup lang="ts">
defineProps<{ step: number }>()
</script>

<template>
  <section class="documentation-lifecycle-scene">
    <div class="documentation-lifecycle-flow">
      <article class="lifecycle-stage lifecycle-specs" :class="{ active: step === 0, passed: step > 0 }">
        <span class="lifecycle-step">01 · FONTES PADRONIZADAS</span>
        <div class="lifecycle-source-icons" aria-label="OpenAPI, AsyncAPI e AWS SAM">
          <figure>
            <div class="lifecycle-source-icon"><img src="/brands/openapi.png" alt="" /></div>
            <figcaption>OpenAPI</figcaption>
          </figure>
          <figure>
            <div class="lifecycle-source-icon"><img src="/brands/asyncapi.png" alt="" /></div>
            <figcaption>AsyncAPI</figcaption>
          </figure>
          <figure>
            <div class="lifecycle-source-icon sam"><img src="/brands/aws-sam-introduction.png" alt="" /></div>
            <figcaption>AWS SAM</figcaption>
          </figure>
        </div>
        <h2>Descrever com padrões</h2>
        <p>Contratos e infraestrutura declarativa</p>
      </article>

      <span class="lifecycle-arrow" :class="{ active: step >= 1 }" aria-hidden="true">→</span>

      <article class="lifecycle-stage lifecycle-code" :class="{ active: step === 1, passed: step > 1, future: step < 1 }">
        <span class="lifecycle-step">02 · JUNTO AO CÓDIGO</span>
        <div class="lifecycle-code-symbol" aria-hidden="true">
          <carbon-logo-git />
          <span>+</span>
          <b>CI</b>
        </div>
        <h2>Versionar e validar</h2>
        <p>As fontes mudam no mesmo ciclo do sistema</p>
      </article>

      <span class="lifecycle-arrow" :class="{ active: step >= 2 }" aria-hidden="true">→</span>

      <article class="lifecycle-stage lifecycle-catalog" :class="{ active: step === 2, future: step < 2 }">
        <span class="lifecycle-step">03 · DOCUMENTAÇÃO VIVA</span>
        <div class="lifecycle-catalog-symbol" aria-hidden="true">
          <span>EC</span>
          <small>EventCatalog</small>
        </div>
        <h2>Gerar o EventCatalog</h2>
        <p>Uma visão navegável, sempre alinhada ao projeto</p>
      </article>
    </div>

    <p class="lifecycle-takeaway">
      A documentação deixa de ser um retrato do sistema e passa a evoluir com ele.
    </p>
  </section>
</template>
