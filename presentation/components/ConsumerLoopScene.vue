<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useIsSlideActive, useNav, useSlideContext } from '@slidev/client'
import { advanceLoop, loopElapsed, loopFrame, pauseLoop, type LoopPlayback } from '../lib/consumer-loop'
import FlowScene from './FlowScene.vue'

const isActive = useIsSlideActive()
const nav = useNav()
const { $renderContext } = useSlideContext()
const live = computed(() => isActive.value && !nav.isPrintMode.value && ['slide', 'presenter'].includes($renderContext.value))
const now = ref(Date.now())
const playback = ref<LoopPlayback>({ startedAt: now.value, elapsed: 0, paused: true })
const frame = computed(() => live.value ? loopFrame(loopElapsed(playback.value, now.value)) : 3)
const labels = ['Evento publicado', 'Consumidores processando', 'Estoque concluído', 'Confirmação concluída']
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
function toggle() {
  setPlayback(pauseLoop(playback.value, Date.now(), !playback.value.paused))
}
function restart() {
  setPlayback({ startedAt: Date.now(), elapsed: 0, paused: playback.value.paused })
}
function advance() {
  setPlayback(advanceLoop(playback.value, Date.now()))
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
  channel = new BroadcastChannel('de-rotas-http-a-eventos:consumer-loop')
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
  <section class="consumer-loop" :class="{ 'loop-paused': playback.paused }" :data-loop-frame="frame" :data-loop-paused="playback.paused" :data-loop-active="live">
    <FlowScene mode="consumers" :step="frame" />
    <div v-if="live" class="loop-controls" @click.stop @pointerdown.stop @keydown.stop>
      <span class="loop-status">{{ playback.paused ? 'Pausado' : 'Loop · 9 s' }}</span>
      <span class="loop-phases" aria-hidden="true"><i v-for="n in 4" :key="n" :class="{ current: frame === n - 1 }" /></span>
      <span class="loop-phase-label">{{ labels[frame] }}</span>
      <button type="button" :aria-label="playback.paused ? 'Continuar animação' : 'Pausar animação'" @click="toggle">{{ playback.paused ? '▶ Continuar' : 'Ⅱ Pausar' }}</button>
      <button v-if="playback.paused" type="button" @click="advance">Avançar etapa</button>
      <button type="button" @click="restart">↺ Reiniciar</button>
    </div>
    <p v-else class="loop-static-note">OrderCreated comunica a criação; cada consumidor conclui seu próprio trabalho.</p>
  </section>
</template>
<style scoped>
.consumer-loop { position:relative; height:418px; }
.consumer-loop :deep(.fine-note) { display:none; }
.loop-paused :deep(.travelling-path) { animation-play-state:paused; }
.loop-controls { position:absolute; bottom:0; left:0; right:0; display:flex; gap:14px; align-items:center; height:30px; font-size:12px; color:#acc1d4; }
.loop-status { color:#f6b478; min-width:74px; }
.loop-phases { display:flex; gap:5px; }.loop-phases i { width:6px; height:6px; background:#3a5065; border-radius:50%; }.loop-phases i.current { background:#ffa85c; }
.loop-phase-label { flex:1; }
.loop-controls button { background:#14283a; border:1px solid #39546c; border-radius:5px; padding:5px 10px; color:#e0edf8; cursor:pointer; font:inherit; }
.loop-controls button:hover { border-color:#ffa85c; }.loop-controls button:focus-visible { outline:2px solid #ffa85c; outline-offset:2px; }
.loop-static-note { font-size:12px; color:#a0b3c6; margin-top:13px; }
</style>
