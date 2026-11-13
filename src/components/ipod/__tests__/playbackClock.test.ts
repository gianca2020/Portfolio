import { describe, expect, it } from 'vitest'
import { elapsedAt, seekClock, skipClock, STOPPED_CLOCK, toggleClock, type Clock } from '../state/playbackClock'

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

  it('seeks within the track, keeping play / pause and never going below zero', () => {
    const playing = toggleClock(STOPPED_CLOCK, 1000, 3)
    const moved = seekClock(playing, 20, 2000)
    expect(moved.status).toBe('playing')
    expect(elapsedAt(moved, 3000)).toBe(21)
    const paused = toggleClock(moved, 3000, 3)
    expect(elapsedAt(seekClock(paused, -4, 4000), 9000)).toBe(0)
  })
})
