export const LOOP_DURATIONS = [1600, 2200, 2200, 3000] as const
export const LOOP_LENGTH = LOOP_DURATIONS.reduce((sum, duration) => sum + duration, 0)
export interface LoopPlayback { startedAt: number; elapsed: number; paused: boolean }
export function loopElapsed(playback: LoopPlayback, now: number) {
  return playback.elapsed + (playback.paused ? 0 : Math.max(0, now - playback.startedAt))
}
export function loopFrame(elapsed: number) {
  let position = Math.max(0, elapsed) % LOOP_LENGTH
  for (let i = 0; i < LOOP_DURATIONS.length; i++) {
    if (position < LOOP_DURATIONS[i]) return i
    position -= LOOP_DURATIONS[i]
  }
  return 0
}
export function pauseLoop(playback: LoopPlayback, now: number, paused: boolean): LoopPlayback {
  return { startedAt: now, elapsed: loopElapsed(playback, now), paused }
}
export function advanceLoop(playback: LoopPlayback, now: number): LoopPlayback {
  const next = (loopFrame(loopElapsed(playback, now)) + 1) % LOOP_DURATIONS.length
  return { startedAt: now, elapsed: LOOP_DURATIONS.slice(0, next).reduce((sum, value) => sum + value, 0), paused: true }
}
