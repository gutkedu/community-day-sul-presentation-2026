<script setup lang="ts">
defineProps<{ step: number }>()

const sources = [
  { name: 'OpenAPI', detail: 'Operações · entradas · respostas', icon: '/brands/openapi.png', tone: 'query', iconClass: '' },
  { name: 'AsyncAPI', detail: 'Mensagens · produtores · consumidores', icon: '/brands/asyncapi.png', tone: 'event', iconClass: '' },
  { name: 'AWS SAM', detail: 'Recursos · dependências AWS', icon: '/brands/aws-sam-introduction.png', tone: 'success', iconClass: 'sam' },
]
</script>

<template>
  <section class="ai-context-scene">
    <div class="ai-context-flow">
      <article class="ai-task">
        <span class="label">TAREFA</span>
        <h2>Alterar <code>CreateOrder</code></h2>
        <p>O contrato muda junto com a implementação.</p>
      </article>

      <span class="ai-flow-arrow" :class="{ active: step >= 1 }" aria-hidden="true">→</span>

      <article class="ai-sources" :class="{ focused: step === 1, passed: step > 1 }">
        <span class="label">CONTEXTO NO REPOSITÓRIO</span>
        <h2>O agente consulta os YAMLs</h2>
        <div v-for="source in sources" :key="source.name" class="ai-source-row" :class="source.tone">
          <div class="ai-source-icon" :class="source.iconClass"><img :src="source.icon" alt="" /></div>
          <div><strong>{{ source.name }}</strong><span>{{ source.detail }}</span></div>
        </div>
      </article>

      <span class="ai-flow-arrow" :class="{ active: step >= 2 }" aria-hidden="true">→</span>

      <div class="ai-outcomes">
        <article class="ai-proposal" :class="{ focused: step === 2, passed: step > 2 }">
          <span class="label">NO DESENVOLVIMENTO</span>
          <h2>Código + contratos</h2>
          <p>A IA apoia a mudança; a equipe revisa.</p>
        </article>
        <span class="ai-down-arrow" :class="{ active: step >= 3 }" aria-hidden="true">↓</span>
        <article class="ai-validation" :class="{ focused: step === 3 }">
          <span class="label">NO CI/CD</span>
          <h2>Contratos × infraestrutura</h2>
          <p>Script cruza OpenAPI e AsyncAPI com o SAM.</p>
        </article>
      </div>
    </div>

    <p class="story-takeaway">Documentação atualizada é parte da entrega, não uma tarefa para depois.</p>
  </section>
</template>
