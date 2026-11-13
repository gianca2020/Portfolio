import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { portfolio } from '../../../data/portfolio'
import { PlaybackContext, type PlaybackValue } from './playbackContext'
import { elapsedAt, seekClock, skipClock, STOPPED_CLOCK, toggleClock, type Clock } from './playbackClock'

/** How far (s) the iPod clock may drift from the embed before it snaps back in step. */
const DRIFT_S = 1.5
/** Scrubbing stops this far (s) short of the end, so it never skips the track by itself. */
const SEEK_END_MARGIN_S = 1

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const tracks = portfolio.nowPlaying
  const [clock, setClock] = useState<Clock>(STOPPED_CLOCK)
  // The embed's length for one track; it no longer applies once the track changes.
  const [embedDuration, setEmbedDuration] = useState<{ trackIndex: number; seconds: number } | null>(null)
  const [seekRequest, setSeekRequest] = useState<PlaybackValue['seekRequest']>(null)
  const seekId = useRef(0)

  const track = tracks[clock.trackIndex]
  const duration =
    embedDuration?.trackIndex === clock.trackIndex ? embedDuration.seconds : (track?.duration ?? 0)

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

  const seek = useCallback(
    (seconds: number) => {
      const target = Math.min(Math.max(0, seconds), Math.max(0, duration - SEEK_END_MARGIN_S))
      setClock((c) => seekClock(c, target, performance.now()))
      seekId.current += 1
      setSeekRequest({ seconds: target, id: seekId.current })
    },
    [duration],
  )

  const reportEmbed = useCallback((trackIndex: number, position: number, seconds: number) => {
    if (seconds > 0) {
      setEmbedDuration((d) => (d?.trackIndex === trackIndex && d.seconds === seconds ? d : { trackIndex, seconds }))
    }
    setClock((c) => {
      if (c.trackIndex !== trackIndex || c.status !== 'playing') return c
      const now = performance.now()
      return Math.abs(elapsedAt(c, now) - position) > DRIFT_S ? seekClock(c, position, now) : c
    })
  }, [])

  // Auto-advance to the next track when the current one ends. (Only a non-empty list ever plays.)
  useEffect(() => {
    if (clock.status !== 'playing') return
    const remaining = duration - elapsedAt(clock, performance.now())
    const timer = window.setTimeout(() => {
      const now = performance.now()
      setClock((c) => skipClock(c, 1, now, tracks.length))
    }, Math.max(0, remaining * 1000))
    return () => window.clearTimeout(timer)
  }, [clock, duration, tracks.length])

  const value = useMemo<PlaybackValue>(
    () => ({
      status: clock.status,
      started: clock.status !== 'stopped',
      tracks,
      trackIndex: clock.trackIndex,
      track,
      duration,
      getElapsed,
      toggle,
      skip,
      seek,
      seekRequest,
      reportEmbed,
    }),
    [clock, tracks, track, duration, getElapsed, toggle, skip, seek, seekRequest, reportEmbed],
  )

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
}
