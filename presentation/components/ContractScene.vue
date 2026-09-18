<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ kind: 'openapi' | 'asyncapi'; step: number }>()
const oas = [
  ['paths:', 1], ['  /orders/{orderId}:', 1], ['    get:', 1], ['      operationId: GetOrderById', 2], ['      x-kind: query', 3], ['  /orders:', 1], ['    post:', 1], ['      operationId: CreateOrder', 2], ['      x-kind: command', 3],
] as const
const aas = [
  ['channels:', 0],
  ['  inventoryCommands:', 0],
  ['    address: inventory-commands', 1],
  ['    x-protocol: sqs', 1],
  ['    messages:', 0],
  ['      ReserveInventory:', 2],
  ['        name: inventory.reserve.v1', 2],
  ['        x-kind: command', 2],
  ['  orderEvents:', 0],
  ['    address: default', 1],
  ['    x-protocol: eventbridge', 1],
  ['    messages:', 0],
  ['      OrderCreated:', 2],
  ['        name: orders.order-created.v1', 2],
  ['        x-kind: event', 2],
] as const
const lines = computed(() => props.kind === 'openapi' ? oas : aas)
const focus = computed(() => props.step)
const explanations = {
  openapi: [
    ['DA ROTA AO CONTRATO', 'As operações HTTP de Orders.', 'Vamos localizar no arquivo as chamadas que vimos no desenho.'],
    ['01 / ROTA + MÉTODO', 'Como o cliente chama Orders.', 'GET consulta um pedido. POST solicita sua criação.'],
    ['02 / OPERATION ID', 'Como identificamos a operação.', 'GetOrderById e CreateOrder identificam as operações dentro do contrato.'],
    ['03 / EXTENSÃO DO PROJETO', 'O significado fica explícito.', 'x-kind é uma convenção nossa. Query e Command não são classificações oficiais do OpenAPI.'],
  ],
  asyncapi: [
    ['DOIS MECANISMOS', 'Command e Event no mesmo contrato.', 'O recorte separa o lugar por onde a mensagem circula do conteúdo que circula.'],
    ['01 / CHANNEL', 'Onde circula?', 'address identifica a fila ou o barramento; x-protocol registra o mecanismo adotado pelo projeto.'],
    ['02 / MESSAGE', 'O que circula?', 'A mensagem recebe um nome versionado; x-kind explicita se ela é Command ou Event.'],
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
      <div v-else class="contract-mini"><span class="mini-pill command">ReserveInventory <b>COMMAND</b></span><span class="mini-pill event">OrderCreated <b>EVENT</b></span></div>
    </aside>
    <p class="fine-note">Recorte didático, não um contrato completo. {{ kind === 'asyncapi' ? 'As operações permanecem no arquivo completo; x-kind e x-protocol são extensões próprias.' : 'Parâmetros, respostas e schemas estão omitidos neste recorte.' }}</p>
  </section>
</template>
