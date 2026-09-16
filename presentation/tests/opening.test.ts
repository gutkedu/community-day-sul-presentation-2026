import test from 'node:test'
import assert from 'node:assert/strict'
import { openingAt } from '../lib/opening.ts'

test('links antigos do slide 5 preservam a última pergunta após reduzir os cliques', () => {
  for (const step of [2, 3, 4, 5]) {
    const state = openingAt('questions', step)
    assert.equal(state.step, 2)
    assert.equal(state.question, 'Quem decide? Quem reage?')
    assert.ok(state.explanation.length > 0)
  }
})

test('voltar restaura a pergunta anterior e valores inválidos não apagam o texto', () => {
  openingAt('questions', 5)
  assert.equal(openingAt('questions', 1).question, 'Pede uma ação ou conta um fato?')
  for (const value of [-1, NaN]) assert.equal(openingAt('questions', value).question, 'Eu via a conexão.')
  assert.equal(openingAt('trace', 5).step, 4)
  assert.equal(openingAt('system', 3).step, 1)
})
