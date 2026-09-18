<script setup lang="ts">
defineProps<{ step: number }>()
</script>
<template>
  <section class="outcome-scene">
    <article class="outcome-before"><span class="label">ANTES</span><div class="loose-files"><span>Diagrama</span><span>OpenAPI</span><span>AsyncAPI</span><span>SAM</span><b>?</b></div><p>Juntar informações<br>de arquivos e diagramas.</p></article>
    <span class="outcome-arrow" aria-hidden="true">→</span>
    <figure class="outcome-dashboard" :class="{ focused: step >= 1 }">
      <img src="/screenshots/eventcatalog-demo-dashboard.png" alt="Página inicial do EventCatalog fictício da palestra, ilustrando a navegação pela documentação." />
      <figcaption><span class="label success-text">AGORA / EVENTCATALOG</span></figcaption>
      <div class="outcome-callout metrics" :class="{ visible: step >= 1 }">Entender as relações entre os domínios</div>
      <div class="outcome-callout navigation" :class="{ visible: step >= 2 }">Acompanhar a arquitetura em evolução</div>
    </figure>
    <p class="fine-note">Catálogo fictício gerado para esta palestra. O resultado observado é qualitativo.</p>
  </section>
</template>
