export function ordersInterfacesVisibility(step: number) {
  const current = Math.min(2, Math.max(0, step))
  return { http: current >= 1, messages: current >= 2 }
}
