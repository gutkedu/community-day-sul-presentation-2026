import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decisionAt, consumersAt } from '../lib/flow.ts'

test('solicitar a criação ainda não significa ter um pedido criado', () => {
  const state = decisionAt(0)
  assert.equal(state.status, 'requested')
  assert.equal(state.order, null)
  assert.equal(state.event, null)
})

test('Orders processa a solicitação antes de mostrar o pedido criado', () => {
  const state = decisionAt(1)
  assert.equal(state.status, 'processing')
  assert.equal(state.order, null)
  assert.equal(state.event, null)
  assert.equal(decisionAt(2).status, 'created')
  assert.equal(decisionAt(2).order, 'ord-42')
  assert.deepEqual(decisionAt(3), decisionAt(2))
})

test('voltar, revisitar e saltar etapas não conserva o pedido de outra etapa', () => {
  const original = decisionAt(0)
  for (const step of [4, 3, 2, 1, 4, 0, 2, 4]) decisionAt(step)
  assert.deepEqual(decisionAt(0), original)
  assert.equal(decisionAt(1).order, null)
  assert.equal(decisionAt(0).order, null)
})

test('consumidores podem estar em estados diferentes após receber o mesmo evento', () => {
  assert.deepEqual(consumersAt(0), { inventory: 'waiting', notifications: 'waiting' })
  assert.deepEqual(consumersAt(1), { inventory: 'processing', notifications: 'processing' })
  assert.deepEqual(consumersAt(2), { inventory: 'done', notifications: 'processing' })
  assert.deepEqual(consumersAt(3), { inventory: 'done', notifications: 'done' })
  assert.deepEqual(consumersAt(1), { inventory: 'processing', notifications: 'processing' })
})
