import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { portfolio } from '../../../data/portfolio'
import { PlaybackContext, type PlaybackValue } from './playbackContext'
import { elapsedAt, skipClock, STOPPED_CLOCK, toggleClock, type Clock } from './playbackClock'

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const tracks = portfolio.nowBuilding
  const [clock, setClock] = useState<Clock>(STOPPED_CLOCK)
  const [volume, setVolumeState] = useState(0.6)

  const getElapsed = useCallback(() => elapsedAt(clock, performance.now()), [clock])

  const toggle = useCallback(() => {
    const now = performance.now()
    setClock((c) => toggleClock(c, now, tracks.length))
  }, [tracks.length])

  const skip = useCallback(
    (delta: 1 | -1) => {
      const now = performance.now()
      setClock((c) => skipClock(c, delta, now, tracks.length))
    },
    [tracks.length],
  )

  const setVolume = useCallback((v: number) => setVolumeState(Math.min(1, Math.max(0, v))), [])

  // Auto-advance to the next track when the current one ends. (Only a non-empty list ever plays.)
  useEffect(() => {
    if (clock.status !== 'playing') return
    const remaining = tracks[clock.trackIndex].duration - elapsedAt(clock, performance.now())
    const timer = window.setTimeout(() => {
      const now = performance.now()
      setClock((c) => skipClock(c, 1, now, tracks.length))
    }, Math.max(0, remaining * 1000))
    return () => window.clearTimeout(timer)
  }, [clock, tracks])

  const value = useMemo<PlaybackValue>(
    () => ({
      status: clock.status,
      started: clock.status !== 'stopped',
      tracks,
      trackIndex: clock.trackIndex,
      track: tracks[clock.trackIndex],
      volume,
      getElapsed,
      toggle,
      skip,
      setVolume,
    }),
    [clock, tracks, volume, getElapsed, toggle, skip, setVolume],
  )

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
}
