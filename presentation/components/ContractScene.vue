<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ kind: 'openapi' | 'asyncapi'; step: number }>()
const oas = [
  ['paths:', 1], ['  /orders/{orderId}:', 1], ['    get:', 1], ['      operationId: GetOrderById', 2], ['      x-kind: query', 3], ['  /orders:', 1], ['    post:', 1], ['      operationId: CreateOrder', 2], ['      x-kind: command', 3],
] as const
const aas = [
  ['channels:', 1], ['  orderEvents:', 1], ['    address: default', 1], ['    x-protocol: eventbridge', 1], ['    messages:', 2], ['      OrderCreated:', 2], ['        name: order.created.v1', 2], ['        x-kind: event', 2], ['operations:', 3], ['  sendOrderCreated:', 3], ['    action: send', 3], ['    channel:', 3], ["      $ref: '#/channels/orderEvents'", 3],
] as const
const lines = computed(() => props.kind === 'openapi' ? oas : aas)
const focus = computed(() => props.kind === 'asyncapi' && props.step === 4 ? 3 : props.step)
const explanations = {
  openapi: [
    ['DA ROTA AO CONTRATO', 'As operações HTTP de Orders.', 'Vamos localizar no arquivo as chamadas que vimos no desenho.'],
    ['01 / ROTA + MÉTODO', 'Como o cliente chama Orders.', 'GET consulta um pedido. POST solicita sua criação.'],
    ['02 / OPERATION ID', 'Como identificamos a operação.', 'GetOrderById e CreateOrder identificam as operações dentro do contrato.'],
    ['03 / EXTENSÃO DO PROJETO', 'O significado fica explícito.', 'x-kind é uma convenção nossa. Query e Command não são classificações oficiais do OpenAPI.'],
  ],
  asyncapi: [
    ['DO FATO AO CONTRATO', 'Uma interface por mensagens.', 'Canal, mensagem e direção descrevem como a aplicação se comunica.'],
    ['01 / CHANNEL', 'Onde as mensagens circulam.', 'default identifica o barramento; x-protocol registra EventBridge como convenção do projeto.'],
    ['02 / MESSAGE', 'O que aconteceu.', 'OrderCreated nomeia o fato. order.created.v1 é a convenção de nome da mensagem.'],
    ['03 / OPERATION', 'Orders envia.', 'action: send descreve a direção da operação do ponto de vista de Orders.'],
    ['04 / OUTRA PERSPECTIVA', 'Inventory recebe.', 'No contrato do consumidor, action: receive. A direção muda; o fato continua sendo um Event.'],
  ],
}
const copy = computed(() => explanations[props.kind][props.step] ?? explanations[props.kind][0])
</script>

<template>
  <section class="contract-scene" :class="kind">
    <div class="code-panel"><div class="code-toolbar"><span class="file-dot" /><code>{{ kind === 'openapi' ? 'orders / openapi.yaml' : 'orders / asyncapi.yaml' }}</code><span>{{ kind === 'openapi' ? '3.1' : '3.0' }} · RECORTE</span></div>
      <div class="code-lines" :class="{ 'has-focus': step > 0 }"><div v-for="([text, group], i) in lines" :key="i" class="code-line" :class="{ selected: group === focus }"><span class="line-number">{{ i + 1 }}</span><code>{{ text }}</code></div></div>
    </div>
    <aside class="contract-explanation"><span class="label">{{ copy[0] }}</span><h2>{{ copy[1] }}</h2><p>{{ copy[2] }}</p>
      <div v-if="kind === 'openapi'" class="contract-mini"><span class="mini-pill query">GetOrderById <b>QUERY</b></span><span class="mini-pill command">CreateOrder <b>COMMAND</b></span></div>
      <div v-else class="contract-mini"><span class="mini-pill event">OrderCreated <b>EVENT</b></span><div class="direction-pair"><span :class="{ 'direction-active': step === 3 }">Orders<br><code>send →</code></span><span :class="{ 'direction-active': step === 4 }">Inventory<br><code>→ receive</code></span></div></div>
    </aside>
    <p class="fine-note">Recorte didático, não um contrato completo. {{ kind === 'asyncapi' ? 'send / receive indicam direção; x-kind e x-protocol são extensões próprias.' : 'Parâmetros, respostas e schemas estão omitidos neste recorte.' }}</p>
  </section>
</template>
