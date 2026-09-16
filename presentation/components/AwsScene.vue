<script setup lang="ts">
defineProps<{ step: number; mode: 'map' | 'execution' }>()
</script>
<template>
  <section class="aws-scene" :class="[`aws-${mode}`, `aws-step-${step}`]">
    <div class="aws-stage">
      <div class="aws-boundary orders-boundary"><span>ORDERS</span></div>
      <div class="aws-boundary inventory-boundary"><span>INVENTORY</span></div>
      <div class="aws-boundary notifications-boundary"><span>NOTIFICATIONS</span></div>
      <svg class="aws-wires" viewBox="0 0 1152 350" aria-hidden="true">
        <defs><marker id="aws-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="context-stroke" /></marker></defs>
        <g :class="{ lit: mode === 'map' || step >= 1 }"><path d="M113 108H160M283 108H352" class="aws-http" marker-end="url(#aws-arrow)" /></g>
        <g :class="{ lit: mode === 'map' || step >= 2 }"><path d="M422 166V228" class="aws-persist" marker-end="url(#aws-arrow)" /></g>
        <g :class="{ lit: mode === 'map' || step >= 3 }"><path d="M490 108H610" class="aws-event" marker-end="url(#aws-arrow)" /></g>
        <g :class="{ lit: mode === 'map' || step >= 4 }"><path d="M739 108H804M884 108H918V65H958M918 108V262H958" class="aws-event" marker-end="url(#aws-arrow)" /><path d="M1044 65H1058" class="inventory-integration" marker-end="url(#aws-arrow)" /><path d="M1044 262H1058" class="notification-delivery" marker-end="url(#aws-arrow)" /></g>
      </svg>
      <div class="aws-client"><span class="label">CLIENTE</span><span class="client-symbol">⌘</span></div>
      <div class="aws-resource api-resource" :class="{ active: mode === 'execution' && step === 1 }"><img src="/aws/api-gateway.png" alt="" /><strong>API Gateway</strong></div>
      <div class="aws-resource lambda-resource" :class="{ active: mode === 'execution' && step === 1 }"><img src="/aws/lambda.png" alt="" /><strong>Orders Lambda</strong></div>
      <div class="aws-resource database-resource" :class="{ active: mode === 'execution' && step === 2 }"><img src="/aws/dynamodb.png" alt="" /><strong>DynamoDB</strong><span>persistência</span></div>
      <div class="aws-resource bus-resource" :class="{ active: mode === 'execution' && step === 3 }"><img src="/aws/eventbridge.png" alt="" /><strong>EventBridge</strong><span>Barramento compartilhado</span></div>
      <div class="aws-rules" :class="{ active: mode === 'execution' && step === 4 }">RULES</div>
      <div class="aws-resource inventory-resource" :class="{ active: mode === 'execution' && step === 4 }"><img src="/aws/lambda.png" alt="" /><strong>Inventory Lambda</strong></div>
      <div class="aws-resource inventory-api-resource" :class="{ active: mode === 'execution' && step === 4 }"><span class="external-api-symbol" aria-hidden="true">API</span><strong>API de Estoque</strong></div>
      <div class="aws-resource notifications-resource" :class="{ active: mode === 'execution' && step === 4 }"><img src="/aws/lambda.png" alt="" /><strong>Notifications Lambda</strong></div>
      <div class="aws-resource ses-resource" :class="{ active: mode === 'execution' && step === 4 }"><img src="/aws/ses.png" alt="" /><strong>Amazon SES</strong></div>
      <div v-if="mode === 'execution'" class="aws-envelope" :class="{ visible: step >= 3 }"><code>source: com.example.orders<br>detail-type: order.created.v1</code></div>
    </div>
    <p v-if="mode === 'execution'" class="aws-caption">{{ ['Uma criação de pedido, do HTTP ao roteamento do fato.', 'A requisição chega à Lambda de Orders pelo API Gateway.', 'Orders persiste o pedido no DynamoDB.', 'A Lambda de Orders publica o fato no EventBridge.', 'As regras do EventBridge encaminham o evento aos consumidores.'][step] }}</p>
    <p v-if="mode === 'execution'" class="fine-note">O banco não publica neste desenho. A sequência didática não promete atomicidade ou entrega exatamente uma vez.</p>
  </section>
</template>
