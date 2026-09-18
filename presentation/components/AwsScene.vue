<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ step: number; mode: 'map' | 'execution' }>()
const current = computed(() => Math.max(0, Math.min(4, Math.trunc(props.step))))
</script>
<template>
  <section class="aws-scene" :class="[`aws-${mode}`, `aws-step-${current}`]">
    <div class="aws-stage">
      <div class="aws-boundary orders-boundary"><span>ORDERS</span></div>
      <div class="aws-boundary inventory-boundary"><span>INVENTORY</span></div>
      <div class="aws-boundary notifications-boundary"><span>NOTIFICATIONS</span></div>
      <svg class="aws-wires" viewBox="0 0 1152 350" aria-hidden="true">
        <defs><marker id="aws-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="context-stroke" /></marker></defs>
        <g :class="{ lit: current >= 1 }"><path d="M105 158H140" class="aws-http" marker-end="url(#aws-arrow)" /><path d="M260 133H320" class="aws-http" marker-end="url(#aws-arrow)" /></g>
        <g :class="{ lit: current >= 2 }"><path d="M380 188V230" class="aws-persist" marker-end="url(#aws-arrow)" /></g>
        <g :class="{ lit: current >= 3 }"><path d="M440 112H560" class="aws-command-async" marker-end="url(#aws-arrow)" /><path d="M710 90H820" class="aws-command-async" marker-end="url(#aws-arrow)" /><path d="M950 90H1000" class="inventory-integration" marker-end="url(#aws-arrow)" /></g>
        <g :class="{ lit: current >= 4 }"><path d="M440 146H500V268H560" class="aws-event" marker-end="url(#aws-arrow)" /><path d="M710 268H820" class="aws-event" marker-end="url(#aws-arrow)" /><path d="M950 268H1000" class="notification-delivery" marker-end="url(#aws-arrow)" /></g>
      </svg>
      <span class="aws-flow-label create-order-label" :class="{ visible: current === 1, active: current === 1 }"><b>CreateOrder</b><small>COMMAND · HTTP</small></span>
      <span class="aws-flow-label reserve-inventory-label" :class="{ visible: current === 3, active: current === 3 }"><b>ReserveInventory</b><small>COMMAND · SQS</small></span>
      <span class="aws-flow-label order-created-label" :class="{ visible: current === 4, active: current === 4 }"><b>OrderCreated</b><small>EVENT · EVENTBRIDGE</small></span>
      <div class="aws-client"><span class="label">CLIENTE</span><span class="client-symbol">⌘</span></div>
      <div class="aws-resource api-resource" :class="{ active: current === 1 }"><img src="/aws/api-gateway.png" alt="" /><strong>API Gateway</strong></div>
      <div class="aws-resource lambda-resource" :class="{ active: current === 1 }"><img src="/aws/lambda.png" alt="" /><strong>Orders</strong></div>
      <div class="aws-resource database-resource" :class="{ active: current === 2 }"><img src="/aws/dynamodb.png" alt="" /><strong>DynamoDB</strong></div>
      <div class="aws-transport-layer">
        <div class="aws-resource queue-resource" :class="{ active: current === 3 }"><img src="/transport/sqs.svg" alt="" /><strong>SQS</strong></div>
        <div class="aws-resource bus-resource" :class="{ active: current === 4 }"><img src="/aws/eventbridge.png" alt="" /><strong>EventBridge</strong></div>
      </div>
      <div class="aws-resource inventory-resource" :class="{ active: current === 3 }"><img src="/aws/lambda.png" alt="" /><strong>Inventory</strong></div>
      <div class="aws-resource inventory-api-resource" :class="{ active: current === 3 }"><span class="external-api-symbol" aria-hidden="true">API</span><strong>API de Estoque</strong></div>
      <div class="aws-resource notifications-resource" :class="{ active: current === 4 }"><img src="/aws/lambda.png" alt="" /><strong>Notifications</strong></div>
      <div class="aws-resource ses-resource" :class="{ active: current === 4 }"><img src="/aws/ses.png" alt="" /><strong>SES</strong></div>
    </div>
  </section>
</template>
