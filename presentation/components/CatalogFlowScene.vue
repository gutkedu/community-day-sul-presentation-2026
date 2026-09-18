<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ step: number }>()
const current = computed(() => Math.max(0, Math.min(2, Math.trunc(props.step))))
</script>

<template>
  <section class="catalog-flow-scene" :data-step="current">
    <figure class="catalog-map-frame">
      <video
        class="catalog-map-media"
        src="/screenshots/eventcatalog-service-map.webm"
        poster="/screenshots/eventcatalog-service-map.png"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        aria-label="Mapa real do EventCatalog com os serviços CreateOrder, ReserveInventory e OrderCreated, tabela DynamoDB, comando SQS e evento EventBridge"
      >
        <span>
          Mapa real do EventCatalog com os serviços CreateOrder, ReserveInventory e OrderCreated.
        </span>
      </video>
    </figure>
  </section>
</template>

<style scoped>
.catalog-flow-scene {
  height: 420px;
}

.catalog-map-frame {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  border: 1px solid #2d4254;
  border-radius: 14px;
  background: #111821;
  box-shadow: 0 18px 42px #050a1099;
}

.catalog-map-media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 51%;
  transform: translate3d(0, 0, 0) scale(1);
  transition: transform .7s cubic-bezier(.22, .8, .22, 1);
  will-change: transform;
}

[data-step="1"] .catalog-map-media {
  transform: translate3d(18%, 0, 0) scale(1.45);
}

[data-step="2"] .catalog-map-media {
  transform: translate3d(-18%, 0, 0) scale(1.45);
}
</style>
