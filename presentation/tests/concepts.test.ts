import test from 'node:test'
import assert from 'node:assert/strict'
import { conceptState, conceptFrame, isLiveConcept } from '../lib/concepts.ts'

test('consultar mantém o estado de negócio e solicitar não antecipa a conclusão', () => {
  for (let step = 0; step < 4; step++) assert.equal(conceptState(step).balance, 'R$ 150')
  assert.equal(conceptState(2).changed, false)
  assert.equal(conceptState(3).changed, true)
  assert.equal(conceptState(0).changed, false)
})

test('o fato existe antes da publicação e das reações', () => {
  assert.equal(conceptState(0).factExists, true)
  assert.equal(conceptState(0).published, false)
  assert.equal(conceptState(1).published, true)
  assert.equal(conceptState(1).reacting, false)
  assert.equal(conceptState(2).reacting, true)
})

test('apenas a cena ativa anima; exportação e prévia preservam a síntese estática', () => {
  assert.equal(isLiveConcept(true, false, 'slide'), true)
  assert.equal(isLiveConcept(true, false, 'presenter'), true)
  assert.equal(isLiveConcept(false, false, 'slide'), false)
  assert.equal(isLiveConcept(true, true, 'slide'), false)
  assert.equal(isLiveConcept(true, false, 'overview'), false)
  const playback = { startedAt: 1000, elapsed: 0, paused: false }
  assert.equal(conceptFrame(false, playback, 1000), 3)
  assert.equal(conceptFrame(true, playback, 1000), 0)
  assert.equal(conceptFrame(true, playback, 10000), 0)
})
