import type { PlaybackStatus } from './playbackContext'

/** Playback clock: `elapsed` seconds at `at` (performance.now() milliseconds). */
export interface Clock {
  status: PlaybackStatus
  trackIndex: number
  at: number
  elapsed: number
}

export const STOPPED_CLOCK: Clock = { status: 'stopped', trackIndex: 0, at: 0, elapsed: 0 }

export const elapsedAt = (clock: Clock, now: number) =>
  clock.status === 'playing' ? clock.elapsed + (now - clock.at) / 1000 : clock.elapsed

/** Play ⇄ pause. With no tracks there is nothing to play: the clock never starts. */
export function toggleClock(clock: Clock, now: number, trackCount: number): Clock {
  if (trackCount === 0) return clock
  return {
    ...clock,
    status: clock.status === 'playing' ? 'paused' : 'playing',
    at: now,
    elapsed: elapsedAt(clock, now),
  }
}

/** ⏮ / ⏭ (and auto-advance), wrapping around the list. */
export function skipClock(clock: Clock, delta: 1 | -1, now: number, trackCount: number): Clock {
  if (trackCount === 0) return clock
  // Like the iPod: ⏮ more than 3 s into a track restarts it.
  const restart = delta === -1 && elapsedAt(clock, now) > 3
  const trackIndex = restart ? clock.trackIndex : (clock.trackIndex + delta + trackCount) % trackCount
  return { ...clock, trackIndex, at: now, elapsed: 0 }
}
