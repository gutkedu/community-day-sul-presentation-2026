import { loopElapsed, loopFrame, type LoopPlayback } from './consumer-loop.ts'
export type ConceptMode = 'language' | 'query' | 'command' | 'event' | 'responsibilities'
export function conceptState(step: number) {
  const frame = Number.isFinite(step) ? Math.max(0, Math.min(3, Math.trunc(step))) : 0
  return { frame, balance: 'R$ 150', changed: frame === 3, factExists: true, published: frame >= 1, reacting: frame >= 2 }
}
export function isLiveConcept(active: boolean, print: boolean, context: string) {
  return active && !print && ['slide', 'presenter'].includes(context)
}
export function conceptFrame(live: boolean, playback: LoopPlayback, now: number) {
  return live ? loopFrame(loopElapsed(playback, now)) : 3
}
