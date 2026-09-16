<script setup lang="ts">
defineProps<{ step: number }>()
</script>
<template>
  <section class="pipeline-scene">
    <div class="pipeline-stage">
      <div class="pipeline-sources" :class="{ focused: step === 1 }">
        <span class="label">01 / FONTES POR DOMÍNIO</span>
        <div v-for="name in ['Orders', 'Inventory', 'Notifications']" :key="name" class="domain-files"><h2>{{ name }}</h2><span class="query">OpenAPI</span><span class="event">AsyncAPI</span><span class="success-text">SAM</span></div>
        <aside class="pipeline-extraction" :class="{ visible: step === 1 }">
          <span class="label">O QUE EXTRAÍMOS</span>
          <div><strong class="query">OpenAPI</strong><span>Rota · operação · entrada · resposta</span></div>
          <div><strong class="event">AsyncAPI</strong><span>Mensagem · esquema · canal · envio / recebimento</span></div>
          <div><strong class="success-text">AWS SAM</strong><span>Lambda · EventBridge · SQS · DynamoDB</span></div>
        </aside>
      </div>
      <span class="pipeline-arrow" aria-hidden="true">→</span>
      <div class="pipeline-build" :class="{ focused: step === 2 }">
        <span class="label">02 / CODEPIPELINE</span>
        <div class="pipeline-tool git-tool">
          <carbon-logo-git aria-hidden="true" />
          <div><strong>Git</strong><span>Coletar repositórios</span></div>
        </div>
        <span class="pipeline-tool-arrow" aria-hidden="true">↓</span>
        <div class="pipeline-tool python-tool">
          <carbon-logo-python aria-hidden="true" />
          <div><strong>Python</strong><span>Validar contratos · Gerar recursos</span></div>
        </div>
      </div>
      <span class="pipeline-arrow" aria-hidden="true">→</span>
      <div class="pipeline-output" :class="{ focused: step === 3 }">
        <span class="label">03 / SITE ESTÁTICO</span>
        <h2>EventCatalog</h2>
        <div class="catalog-package">
          <carbon-logo-npm aria-hidden="true" />
          <div><span class="label">PACOTE NPM</span><code>@eventcatalog/core</code></div>
        </div>
        <div class="catalog-stack"><span>Domínios</span><span>Serviços</span><span>Eventos</span><span>Canais · esquemas</span></div>
        <div class="catalog-artifact"><span class="label">npm run build</span><b>→</b><code>dist/</code></div>
      </div>
    </div>
    <p class="story-takeaway">Os arquivos de origem continuam no projeto. O catálogo é regenerado.</p>
  </section>
</template>
