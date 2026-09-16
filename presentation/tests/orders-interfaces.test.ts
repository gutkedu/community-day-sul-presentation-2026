import test from 'node:test'
import assert from 'node:assert/strict'
import { ordersInterfacesVisibility } from '../lib/orders-interfaces.ts'

test('revela HTTP no primeiro clique e mensagens no segundo', () => {
  assert.deepEqual(ordersInterfacesVisibility(0), { http: false, messages: false })
  assert.deepEqual(ordersInterfacesVisibility(1), { http: true, messages: false })
  assert.deepEqual(ordersInterfacesVisibility(2), { http: true, messages: true })
})
