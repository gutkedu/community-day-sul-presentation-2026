<script setup lang="ts">
defineProps<{ step: number }>()
</script>
<template>
  <section class="pipeline-scene generation-scene">
    <div class="pipeline-stage">
      <div class="pipeline-sources" :class="{ focused: step === 1 }">
        <span class="label">01 / FONTES POR DOMÍNIO</span>
        <div v-for="name in ['Orders', 'Inventory', 'Notifications']" :key="name" class="domain-files" :class="{ covered: step === 1 }" :aria-hidden="step === 1"><h2>{{ name }}</h2><span class="query">OpenAPI</span><span class="event">AsyncAPI</span><span class="success-text">SAM</span></div>
        <aside class="pipeline-extraction" :class="{ visible: step === 1 }" :aria-hidden="step !== 1">
          <span class="label">O QUE EXTRAÍMOS</span>
          <div><strong class="query">OpenAPI</strong><span>Rota · operação · entrada · resposta</span></div>
          <div><strong class="event">AsyncAPI</strong><span>Mensagem · esquema · canal · relações</span></div>
          <div><strong class="success-text">AWS SAM</strong><span>Lambda · EventBridge · SQS · DynamoDB</span></div>
        </aside>
      </div>
      <span class="pipeline-arrow" aria-hidden="true">→</span>
      <div class="pipeline-build" :class="{ focused: step === 2 }">
        <span class="label">02 / GERAÇÃO DO CONTEÚDO</span>
        <div class="generator-overview" :class="{ covered: step === 2 }" :aria-hidden="step === 2">
          <div class="repository-input"><carbon-logo-git aria-hidden="true" /><span>CodePipeline · Coletar repositórios</span></div>
          <div class="pipeline-tool python-tool">
            <carbon-logo-python aria-hidden="true" />
            <div><strong>Script</strong><span>Traduz os YAMLs para o catálogo</span></div>
          </div>
          <span class="pipeline-tool-arrow" aria-hidden="true">↓</span>
          <div class="generated-files">
            <span class="file-extension">.mdx</span>
            <div><strong>Markdown / MDX</strong><span>Recursos + relações</span></div>
          </div>
          <p class="generated-summary">Domínios · serviços · mensagens</p>
        </div>
        <aside class="generated-example" :class="{ visible: step === 2 }" :aria-hidden="step !== 2">
          <div class="generated-example-heading"><strong>Arquivo gerado</strong><code>index.mdx</code></div>
          <span class="label">CREATE ORDER · RECORTE DOS METADADOS</span>
          <pre><code><span class="metadata-key">id:</span> orders-create-order
<span class="metadata-key">sends:</span>
  - <span class="metadata-key">id:</span> <span class="event-reference">OrderCreated</span>
    <span class="metadata-key">version:</span> 1.0.0</code></pre>
          <p><code>sends</code> registra o que o serviço envia.</p>
          <p>O consumidor referencia o mesmo evento em <code>receives</code>.</p>
        </aside>
      </div>
      <span class="pipeline-arrow" aria-hidden="true">→</span>
      <div class="pipeline-output" :class="{ focused: step === 3 }">
        <span class="label">03 / CONSTRUÇÃO DO SITE</span>
        <h2>EventCatalog</h2>
        <div class="catalog-package">
          <carbon-logo-npm aria-hidden="true" />
          <div><span class="label">PACOTE NPM</span><code>@eventcatalog/core</code></div>
        </div>
        <p class="catalog-build-summary">Lê os arquivos gerados e conecta as relações.</p>
        <div class="catalog-artifact"><span class="label">npm run build</span><b>→</b><code>dist/</code></div>
        <p class="catalog-result">Páginas e mapas navegáveis</p>
      </div>
    </div>
    <p class="story-takeaway">O gerador cria o conteúdo. O EventCatalog constrói a visão navegável.</p>
  </section>
</template>

<style scoped>
.generation-scene .pipeline-stage { grid-template-columns:300px 32px 448px 32px 308px; gap:8px; }
.generation-scene .pipeline-stage>div { height:367px; }
.generation-scene .pipeline-stage>.pipeline-build { position:relative; overflow:hidden; }
.generation-scene .pipeline-stage .label { font-size:11px; }
.generation-scene .domain-files { margin-top:17px; padding-top:13px; }
.generation-scene .domain-files h2 { font-size:23px; line-height:1.2; margin:0 0 5px; }
.generation-scene .domain-files span { font-size:12px; padding:5px 8px; }
.generation-scene .pipeline-extraction { inset:45px 12px 12px; padding:15px; background:#0c1b2b; }
.generation-scene .pipeline-extraction>.label { line-height:1.2; }
.generation-scene .pipeline-extraction>div { display:block; padding:9px 0; }
.generation-scene .pipeline-extraction strong { display:block; margin-bottom:5px; font-size:16px; line-height:1.2; }
.generation-scene .pipeline-extraction div span { display:block; font-size:15px; line-height:1.3; }
.generation-scene .covered { visibility:hidden; }
.repository-input { display:flex; gap:10px; align-items:center; margin:25px 0 22px; color:#b9cbd9; font-size:14px; }
.repository-input svg { width:25px; height:25px; color:#f05032; }
.generation-scene .pipeline-tool { padding:16px; grid-template-columns:42px 1fr; }
.generation-scene .pipeline-tool strong { font-size:22px; }
.generation-scene .pipeline-tool span { font-size:15px; }
.generation-scene .pipeline-tool-arrow { height:33px; line-height:33px; }
.generated-files { display:flex; align-items:center; gap:14px; padding:16px; border:1px solid #476c70; border-radius:9px; background:#0d252d; }
.file-extension { padding:12px 8px; border:1px solid var(--success); border-radius:5px; color:var(--success); font:15px 'Roboto Mono'; }
.generated-files strong,.generated-files div>span { display:block; }
.generated-files strong { color:#e3eef7; font-size:21px; font-weight:500; }
.generated-files div>span { margin-top:5px; color:#b9cbd9; font-size:16px; }
.generation-scene .generated-summary { margin:13px 0 0; color:#aebfd0; font-size:14px; text-align:center; }
.generated-example { position:absolute; inset:46px 12px 12px; padding:16px; border:1px solid var(--success); border-radius:10px; background:#0c1b2b; opacity:0; visibility:hidden; transform:translateY(24px); transition:opacity .32s,transform .32s,visibility .32s; }
.generated-example.visible { opacity:1; visibility:visible; transform:translateY(0); }
.generated-example-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.generated-example-heading strong { color:#e3eef7; font-size:20px; font-weight:500; }
.generated-example-heading code { color:var(--success); font-size:15px; }
.generated-example>.label { font-size:10px!important; color:#9fb6c8; }
.generated-example pre { margin:10px 0 12px; padding:10px 15px; background:#07131f; border:1px solid #2c475b; border-radius:6px; }
.generated-example pre code { font:16px/1.65 'Roboto Mono',monospace; color:#dce8f2; }
.metadata-key { color:#8bc7df; }
.event-reference { color:var(--event); }
.generation-scene .generated-example p { margin:8px 0 0; font-size:15px; line-height:1.4; color:#b9cbd9; }
.generated-example p code { color:var(--success); font-size:15px; }
.generation-scene .pipeline-output h2 { margin:25px 0 20px; font-size:30px; }
.generation-scene .catalog-package { margin-bottom:20px; }
.generation-scene .catalog-build-summary { margin:0; color:#b9cbd9; font-size:18px; line-height:1.45; }
.generation-scene .catalog-artifact { margin-top:22px; }
.generation-scene .catalog-result { margin:15px 0 0; color:var(--success); font-size:16px; }
.generation-scene .story-takeaway { font-size:22px; }
</style>
