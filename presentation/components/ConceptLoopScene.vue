<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useIsSlideActive, useNav, useSlideContext } from '@slidev/client'
import { pauseLoop, type LoopPlayback } from '../lib/consumer-loop'
import ConceptScene from './ConceptScene.vue'
import { conceptFrame, isLiveConcept, type ConceptMode } from '../lib/concepts'
const props = defineProps<{ mode: ConceptMode; labels: string[] }>()

const isActive = useIsSlideActive()
const nav = useNav()
const { $renderContext } = useSlideContext()
const live = computed(() => isLiveConcept(isActive.value, nav.isPrintMode.value, $renderContext.value))
const now = ref(Date.now())
const playback = ref<LoopPlayback>({ startedAt: now.value, elapsed: 0, paused: true })
const frame = computed(() => conceptFrame(live.value, playback.value, now.value))
let timer: ReturnType<typeof setInterval> | undefined
let channel: BroadcastChannel | undefined
let motion: MediaQueryList | undefined
let stopWatching: (() => void) | undefined

function publish(userInitiated = false) {
  channel?.postMessage({ type: 'playback', userInitiated, playback: { ...playback.value } })
}
function setPlayback(value: LoopPlayback) {
  now.value = Date.now()
  playback.value = value
  publish(true)
}
function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
  channel?.close()
  channel = undefined
  playback.value = { startedAt: Date.now(), elapsed: 0, paused: true }
}
function start() {
  stop()
  now.value = Date.now()
  playback.value = { startedAt: now.value, elapsed: 0, paused: motion?.matches ?? false }
  channel = new BroadcastChannel(`de-rotas-http-a-eventos:concept-${props.mode}`)
  channel.onmessage = ({ data }) => {
    if (!live.value) return
    if (data?.type === 'join') publish()
    if (data?.type === 'playback') {
      const value = data.playback
      if (typeof value?.paused !== 'boolean' || !Number.isFinite(value?.startedAt) || !Number.isFinite(value?.elapsed)) return
      now.value = Date.now()
      playback.value = value
      // A tab that prefers reduced motion can always stop automatic playback.
      if (motion?.matches && !value.paused && !data.userInitiated) {
        playback.value = pauseLoop(value, now.value, true)
        publish()
      }
    }
  }
  channel.postMessage({ type: 'join' })
  timer = setInterval(() => { if (!playback.value.paused) now.value = Date.now() }, 80)
}
function motionChanged() {
  if (live.value && motion?.matches) setPlayback(pauseLoop(playback.value, Date.now(), true))
}
onMounted(() => {
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', motionChanged)
  stopWatching = watch(live, value => value ? start() : stop(), { immediate: true })
})
onUnmounted(() => {
  stopWatching?.()
  motion?.removeEventListener('change', motionChanged)
  stop()
})
</script>
<template>
  <section class="concept-loop" :class="{ 'loop-paused': playback.paused }" :data-concept="mode" :data-loop-frame="frame" :data-loop-paused="playback.paused" :data-loop-active="live">
    <ConceptScene :mode="mode" :step="frame" :animate="live" />

  </section>
</template>
<style scoped>
.concept-loop { position:relative; height:418px; }
.concept-loop :deep(.fine-note) { display:none; }
.loop-paused :deep(.concept-packet) { animation-play-state:paused; }
</style>
