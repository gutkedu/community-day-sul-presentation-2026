<script setup lang="ts">
import { computed } from 'vue'
import { decisionAt, consumersAt } from '../lib/flow'
const props = defineProps<{ mode: 'decision' | 'communications' | 'consumers'; step: number }>()
const decision = computed(() => decisionAt(props.step))
const consumers = computed(() => consumersAt(props.step))
const statusText = { waiting: 'Aguardando evento', processing: 'Processando', done: 'Concluído' }
</script>

<template>
  <section class="flow-scene">
    <template v-if="mode === 'decision'">
      <div class="scenario-heading"><span class="scenario-tag">CRIAR UM PEDIDO</span><span>Da solicitação à mudança no negócio</span></div>
      <div class="flow-stage decision-stage">
        <svg class="flow-wires" viewBox="0 0 1152 280" aria-hidden="true"><path class="command-stroke" d="M258 114H334"/><path :class="decision.order ? 'success-stroke' : 'muted-stroke'" d="M596 114H673"/><path class="arrow-tip command-stroke" d="m322 108 12 6-12 6"/><path class="arrow-tip" :class="decision.order ? 'success-stroke' : 'muted-stroke'" d="m661 108 12 6-12 6"/></svg>
        <article class="flow-node request-node command-border"><span class="label command">CLIENTE · INTENÇÃO</span><h2>CreateOrder</h2><p class="request-phrase">“Quero criar<br>um pedido.”</p><span class="node-caption">1 × SKU-1</span></article>
        <article class="flow-node decision-node" :class="{ 'success-border': decision.order }"><span class="label">QUEM EXECUTA</span><h2>Orders</h2><p>Verifica as regras.</p><span class="state-chip" :class="{ success: decision.order }">{{ decision.status === 'requested' ? 'Solicitação recebida' : decision.status === 'processing' ? 'Em processamento' : '✓ Criação concluída' }}</span></article>
        <article class="flow-node result-node" :class="{ 'success-border': decision.order, subdued: !decision.order }"><span class="label">RESULTADO</span><h2>{{ decision.order || 'Aguardando criação' }}</h2><code>{{ decision.order ? 'status: CREATED' : '—' }}</code><span class="node-caption">{{ decision.order ? 'O pedido agora existe.' : 'Ainda é uma solicitação.' }}</span></article>
      </div>
      <div class="takeaway-bar"><span>→</span><p>{{ decision.status === 'requested' ? 'CreateOrder expressa o que o cliente quer que aconteça.' : decision.status === 'processing' ? 'Orders verifica as regras e executa a criação.' : 'Agora aconteceu: Orders criou o pedido ord-42.' }}</p></div>
    </template>

    <template v-else-if="mode === 'communications'">
      <div class="completion-stage">
        <svg viewBox="0 0 1152 330" class="flow-wires" aria-hidden="true">
          <path :class="step >= 1 ? 'success-stroke' : 'muted-stroke'" d="M360 150H280m12-6-12 6 12 6" />
          <path :class="step >= 2 ? 'event-stroke' : 'muted-stroke'" d="M620 150H690V90H760m-12-6 12 6-12 6M955 165V190H852V214m-6-12 6 12 6-12M955 190H1058V214m-6-12 6 12 6-12" />
        </svg>
        <article class="completion-card completion-client" :class="{ emphasized: step >= 1 }">
          <span class="label">RESPOSTA AO CLIENTE</span><h2>201 Created</h2><code>orderId: ord-42</code><p>“Seu pedido foi criado.”</p>
        </article>
        <article class="completion-card completion-orders">
          <span class="label">ORDERS · CONCLUÍDO</span><h2>Pedido criado</h2><span class="state-chip success">✓ ord-42 · CREATED</span>
        </article>
        <article class="completion-card completion-event" :class="{ emphasized: step >= 2 }">
          <span class="label">FATO PARA OUTROS SERVIÇOS</span><h2>OrderCreated</h2><code>orderId: ord-42</code>
        </article>
        <article v-for="(consumer, i) in [{ name: 'Inventory', task: 'Reservar estoque' }, { name: 'Notifications', task: 'Enviar confirmação' }]" :key="consumer.name" class="completion-card completion-reaction" :class="{ emphasized: step >= 2 }" :style="{ left: `${760 + i * 206}px` }">
          <span class="label">{{ consumer.name }}</span><h3>{{ consumer.task }}</h3><span class="pending-label">◷ Ainda pode estar pendente</span>
        </article>
      </div>
      <div class="takeaway-bar"><span>→</span><p>{{ ['Retomando a criação: o que a resposta ao cliente confirma?', '201 confirma a criação do pedido para quem solicitou.', '201 Created não confirma estoque reservado nem notificação enviada.'][step] }}</p></div>

    </template>

    <template v-else>
      <div class="consumer-stage">
        <svg viewBox="0 0 1152 320" class="flow-wires" aria-hidden="true"><path class="muted-stroke" d="M258 200H334"/><path class="event-stroke" d="M596 200H660"/><path :class="step >= 1 ? 'event-stroke' : 'muted-stroke'" d="M792 200H835V77H905M835 200V245H905"/><circle :class="step >= 1 ? 'event-dot' : 'muted-dot'" cx="835" cy="200" r="5"/><path v-if="step >= 1" class="travelling-path" d="M792 200H835V77H905M835 200V245H905"/></svg>
        <article class="historical-client"><span class="label">CLIENTE</span><h2>Quem fez<br>o pedido.</h2><p>Agora acompanhamos<br>os outros serviços.</p></article>
        <article class="producer-node"><span class="label">PRODUTOR</span><h2>Orders</h2><span class="state-chip success">✓ ord-42 criado</span></article>
        <article class="event-envelope"><span class="label event">FATO PUBLICADO</span><h2>OrderCreated</h2><code>orderId: ord-42</code></article>
        <article class="bus-node"><span class="bus-symbol">⋮</span><strong>Event<br>bus</strong></article>
        <article v-for="(name, i) in ['inventory', 'notifications'] as const" :key="name" class="consumer-node" :class="{ completed: consumers[name] === 'done', processing: consumers[name] === 'processing' }" :style="{ top: `${i * 168 + 6}px` }"><span class="label">{{ name.toUpperCase() }}</span><h3>{{ name === 'inventory' ? 'Reservar estoque' : 'Enviar confirmação' }}</h3><span class="state-chip" :class="{ success: consumers[name] === 'done' }">{{ consumers[name] === 'done' ? '✓ ' : '' }}{{ statusText[consumers[name]] }}</span></article>
      </div>
      <div class="takeaway-bar"><span>↗</span><p>{{ step === 0 ? 'O fato já aconteceu. As reações ainda não.' : step === 1 ? 'Receber o evento é o começo do trabalho de cada consumidor.' : step === 2 ? 'Estoque reservado. A confirmação ainda está em processamento.' : 'Cada consumidor concluiu sua responsabilidade.' }}</p></div>
      <p class="fine-note">Ordem ilustrativa. OrderCreated não garante que estoque e notificação já terminaram.</p>
    </template>
  </section>
</template>

<style scoped>
.request-phrase { font-size: 23px; line-height: 1.4; color: var(--text); }
.decision-stage .result-node h2 { font-size: 26px; }
</style>
