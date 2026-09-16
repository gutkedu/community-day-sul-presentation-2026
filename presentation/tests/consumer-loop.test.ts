import test from 'node:test'
import assert from 'node:assert/strict'
import { loopFrame, loopElapsed, pauseLoop, advanceLoop } from '../lib/consumer-loop.ts'
import { consumersAt } from '../lib/flow.ts'

test('o ciclo mantém quatro estados e recomeça após nove segundos', () => {
  assert.deepEqual([0, 1599, 1600, 3799, 3800, 5999, 6000, 8999, 9000].map(loopFrame), [0, 0, 1, 1, 2, 2, 3, 3, 0])
  assert.deepEqual(consumersAt(loopFrame(4000)), { inventory: 'done', notifications: 'processing' })
  assert.deepEqual(consumersAt(loopFrame(7000)), { inventory: 'done', notifications: 'done' })
})

test('pausar congela o tempo e continuar preserva a posição', () => {
  const running = { startedAt: 1000, elapsed: 0, paused: false }
  const paused = pauseLoop(running, 5100, true)
  assert.equal(loopElapsed(paused, 99999), 4100)
  const resumed = pauseLoop(paused, 100000, false)
  assert.equal(loopElapsed(resumed, 101000), 5100)
})

test('avançar manualmente mantém a pausa e retorna ao início após a conclusão', () => {
  let playback = { startedAt: 0, elapsed: 0, paused: true }
  for (const frame of [1, 2, 3, 0]) {
    playback = advanceLoop(playback, 1000)
    assert.equal(playback.paused, true)
    assert.equal(loopFrame(playback.elapsed), frame)
  }
})
