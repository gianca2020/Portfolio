import { describe, expect, it } from 'vitest'
import { elapsedAt, skipClock, STOPPED_CLOCK, toggleClock, type Clock } from '../state/playbackClock'

describe('playback clock', () => {
  it('starts, pauses and resumes, keeping elapsed time across the pause', () => {
    const playing = toggleClock(STOPPED_CLOCK, 1000, 3)
    expect(playing.status).toBe('playing')
    expect(elapsedAt(playing, 3500)).toBe(2.5)
    const paused = toggleClock(playing, 3500, 3)
    expect(paused.status).toBe('paused')
    expect(elapsedAt(paused, 9000)).toBe(2.5)
    expect(elapsedAt(toggleClock(paused, 9000, 3), 10_000)).toBe(3.5)
  })

  it('skips with wrap-around, and ⏮ past 3 s restarts the track', () => {
    const clock: Clock = { status: 'paused', trackIndex: 0, at: 0, elapsed: 1 }
    expect(skipClock(clock, 1, 0, 3).trackIndex).toBe(1)
    expect(skipClock(clock, -1, 0, 3).trackIndex).toBe(2)
    const restarted = skipClock({ ...clock, trackIndex: 1, elapsed: 10 }, -1, 0, 3)
    expect(restarted).toMatchObject({ trackIndex: 1, elapsed: 0 })
  })

  it('never starts or skips with an empty track list', () => {
    expect(toggleClock(STOPPED_CLOCK, 1000, 0)).toBe(STOPPED_CLOCK)
    expect(skipClock(STOPPED_CLOCK, 1, 1000, 0)).toBe(STOPPED_CLOCK)
  })
})
