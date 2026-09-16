export function decisionAt(step: number) {
  const current = Math.max(0, Math.min(2, Math.trunc(step)))
  return {
    status: ['requested', 'processing', 'created'][current],
    order: current === 2 ? 'ord-42' : null,
    event: null,
  }
}

export function consumersAt(step: number) {
  return {
    inventory: step >= 2 ? 'done' : step >= 1 ? 'processing' : 'waiting',
    notifications: step >= 3 ? 'done' : step >= 1 ? 'processing' : 'waiting',
  }
}
