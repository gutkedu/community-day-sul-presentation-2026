<script setup lang="ts">
withDefaults(defineProps<{
  step: number
  layout?: 'cards' | 'steps' | 'rows' | 'mapping'
  items: {
    label?: string
    title: string
    body?: string
    code?: string
    tone?: string
    icon?: string
    iconClass?: string
  }[]
  takeaway?: string
  warning?: string
  brand?: string
}>(), { layout: 'cards' })
</script>

<template>
  <section class="story-scene" :class="[`story-${layout}`, { 'with-brand': brand }]">
    <img v-if="brand" class="story-brand" :src="brand" alt="" />
    <div class="story-items" :style="{ '--items': items.length }">
      <article v-for="(item, i) in items" :key="i" class="story-item" :class="[item.tone || 'neutral', { focused: step === i + 1, passed: step > i + 1, quiet: step > 0 && step < i + 1 }]">
        <span v-if="layout === 'steps'" class="step-orb" :class="{ dated: item.label }">{{ item.label || i + 1 }}</span>
        <span v-if="item.label && layout !== 'steps'" class="label story-label">{{ item.label }}</span>
        <div v-if="item.icon" class="story-icon" :class="item.iconClass">
          <img :src="item.icon" alt="" />
        </div>
        <h2>{{ item.title }}</h2>
        <span v-if="layout === 'mapping'" class="mapping-arrow" aria-hidden="true">→</span>
        <p v-if="item.body">{{ item.body }}</p>
        <code v-if="item.code">{{ item.code }}</code>
      </article>
    </div>
    <p v-if="takeaway" class="story-takeaway">{{ takeaway }}</p>
    <p v-if="warning" class="story-warning">{{ warning }}</p>
  </section>
</template>
