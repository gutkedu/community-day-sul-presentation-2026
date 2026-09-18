<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ step: number }>()
const current = computed(() => Math.max(0, Math.min(3, Math.trunc(props.step))))
</script>

<template>
  <section class="pipeline-scene deploy-scene" :data-step="current">
    <div class="pipeline-stage deploy-pipeline-stage">
      <div class="deploy-pipeline-card" :class="{ focused: current === 1 }">
        <span class="label">01 / ARTEFATO</span>
        <carbon-folder-details aria-hidden="true" />
        <h2><code>dist/</code></h2>
        <p>HTML, CSS e JavaScript</p>
      </div>

      <span class="pipeline-arrow" aria-hidden="true">→</span>

      <div class="deploy-pipeline-card" :class="{ focused: current === 2 }">
        <span class="label">02 / HOSPEDAGEM</span>
        <img src="/aws/s3.svg" alt="" />
        <h2>S3 privado</h2>
        <p>Arquivos estáticos</p>
      </div>

      <span class="pipeline-arrow" aria-hidden="true">→</span>

      <div class="deploy-pipeline-card" :class="{ focused: current === 3 }">
        <span class="label">03 / DISTRIBUIÇÃO</span>
        <img src="/aws/cloudfront.svg" alt="" />
        <h2>CloudFront</h2>
        <p>Entrega o catálogo pela CDN</p>
        <div class="deploy-audience">
          <carbon-user-avatar aria-hidden="true" />
          <div>
            <span class="label">ACESSO</span>
            <strong>Usuário</strong>
            <span>Catálogo atualizado</span>
          </div>
        </div>
      </div>
    </div>

    <p class="story-takeaway">O resultado da pipeline é documentação estática, navegável e distribuída pela CDN.</p>
  </section>
</template>
