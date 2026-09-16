<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ step: number }>()
const lines = [
  ['Resources:', 0],
  ['  OrdersApi:', 1],
  ['    Type: AWS::Serverless::Api', 1],
  ['  CreateOrderFunction:', 1],
  ['    Type: AWS::Serverless::Function', 1],
  ['  OrdersTable:', 2],
  ['    Type: AWS::DynamoDB::Table', 2],
  ['  ApplicationEventBus:', 3],
  ['    Type: AWS::Events::EventBus', 3],
] as const
const explanations = [
  ['INFRAESTRUTURA COMO CÓDIGO', 'Descreve funções, APIs, bancos e barramentos como código.'],
  ['01 / ENTRADA E EXECUÇÃO', 'API Gateway e Lambda recebem a criação do pedido.'],
  ['02 / ESTADO', 'DynamoDB registra a persistência do domínio Orders.'],
  ['03 / DISTRIBUIÇÃO', 'EventBridge representa o barramento usado para publicar o fato.'],
] as const
const copy = computed(() => explanations[props.step] ?? explanations[0])
</script>

<template>
  <section class="sam-infrastructure">
    <div class="sam-code">
      <header><span class="sam-dot" /><code>orders / template.yaml</code><span>AWS SAM · RECORTE</span></header>
      <div class="sam-lines" :class="{ focused: step > 0 }">
        <div v-for="([text, group], i) in lines" :key="i" class="sam-line" :class="{ selected: group === step || (step === 0 && group === 0) }">
          <span>{{ i + 1 }}</span><code>{{ text }}</code>
        </div>
      </div>
    </div>

    <aside>
      <div class="sam-brand">
        <div class="sam-mascot" aria-hidden="true">
          <img src="/brands/aws-sam-introduction.png" alt="" />
        </div>
        <div class="sam-brand-copy">
          <strong>AWS SAM</strong>
          <span>SERVERLESS APPLICATION MODEL</span>
        </div>
      </div>
      <span class="label">{{ copy[0] }}</span>
      <h2>{{ copy[1] }}</h2>
      <div class="sam-capabilities">
        <span :class="{ active: step === 1 }">HTTP + COMPUTE</span>
        <span :class="{ active: step === 2 }">PERSISTÊNCIA</span>
        <span :class="{ active: step === 3 }">EVENT BUS</span>
      </div>
      <p>O template conecta recursos e referências que não pertencem aos contratos de interface.</p>
    </aside>
  </section>
</template>

<style scoped>
.sam-infrastructure { display:grid; grid-template-columns:650px 1fr; gap:42px; align-items:start; }
.sam-code { border:1px solid #38516a; border-radius:13px; overflow:hidden; background:#0d1b2b; }
.sam-code header { display:flex; align-items:center; gap:10px; padding:14px 18px; border-bottom:1px solid #2d435a; background:#142439; color:#96aabd; }
.sam-code header>span:last-child { margin-left:auto; font:10px Inter; letter-spacing:1px; }
.sam-dot { width:7px; height:7px; border-radius:50%; background:#6fcf97; }
.sam-lines { padding:18px 0; }
.sam-line { height:31px; display:flex; align-items:center; padding:0 18px; border-left:3px solid transparent; transition:opacity .3s,background .3s; }
.sam-line span { width:32px; color:#71869b; font:11px 'Roboto Mono'; }
.sam-line code { white-space:pre; color:#d7e3ed; font-size:16px; }
.sam-lines.focused .sam-line:not(.selected) { opacity:.32; }
.sam-line.selected { opacity:1!important; border-left-color:#6fcf97; background:#6fcf9712; }
.sam-infrastructure aside { padding:14px 16px; border:1px solid #2d435a; border-radius:13px; background:#0f1f30; }
.sam-brand { display:grid; grid-template-columns:96px 1fr; gap:13px; align-items:center; margin-bottom:9px; }
.sam-brand-copy strong { display:block; color:#fff; font-size:22px; }
.sam-brand-copy span { display:block; margin-top:6px; color:#8fa5b8; font:700 9px Inter; line-height:1.35; letter-spacing:1px; }
.sam-mascot { position:relative; width:90px; height:96px; overflow:hidden; border-radius:9px; background:#fff; }
.sam-mascot img { position:absolute; top:0; left:0; width:500px; height:140px; max-width:none; }
.sam-infrastructure .label { color:#6fcf97; }
.sam-infrastructure h2 { font-size:22px; line-height:1.16; margin:8px 0 13px; }
.sam-capabilities { display:grid; gap:6px; }
.sam-capabilities span { border:1px solid #354b61; border-radius:7px; padding:7px 11px; color:#8398aa; font:700 10px Inter; letter-spacing:1px; }
.sam-capabilities span.active { border-color:#6fcf97; background:#6fcf9712; color:#dcebe4; }
.sam-infrastructure aside p { margin-top:11px; color:#9fb1c1; font-size:13px; line-height:1.35; }
</style>
