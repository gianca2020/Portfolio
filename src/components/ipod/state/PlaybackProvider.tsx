import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { portfolio } from '../../../data/portfolio'
import { PlaybackContext, type PlaybackValue } from './playbackContext'
import { elapsedAt, seekClock, skipClock, STOPPED_CLOCK, toggleClock, type Clock } from './playbackClock'

/** How far (s) the iPod clock may drift from the embed before it snaps back in step. */
const DRIFT_S = 1.5
/** Scrubbing stops this far (s) short of the end, so it never skips the track by itself. */
const SEEK_END_MARGIN_S = 1

type EmbedDuration = { trackIndex: number; seconds: number } | null

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const tracks = portfolio.nowPlaying
  const [clock, setClockState] = useState<Clock>(STOPPED_CLOCK)
  // The embed's length for one track; it no longer applies once the track changes.
  const [embedDuration, setEmbedDurationState] = useState<EmbedDuration>(null)
  const [seekRequest, setSeekRequest] = useState<PlaybackValue['seekRequest']>(null)
  const seekId = useRef(0)

  // Live copies, so several presses or wheel steps before the next render build on each other.
  const clockRef = useRef(clock)
  const setClock = useCallback((next: Clock) => {
    clockRef.current = next
    setClockState(next)
  }, [])
  const embedDurationRef = useRef(embedDuration)
  const setEmbedDuration = useCallback((next: EmbedDuration) => {
    embedDurationRef.current = next
    setEmbedDurationState(next)
  }, [])

  const requestSeek = useCallback((seconds: number) => {
    seekId.current += 1
    setSeekRequest({ seconds, id: seekId.current })
  }, [])

  const track = tracks[clock.trackIndex]
  const canScrub = embedDuration?.trackIndex === clock.trackIndex
  const duration = canScrub ? embedDuration.seconds : (track?.duration ?? 0)

  const getElapsed = useCallback(() => elapsedAt(clockRef.current, performance.now()), [])

  const toggle = useCallback(() => {
    setClock(toggleClock(clockRef.current, performance.now(), tracks.length))
  }, [setClock, tracks.length])

  const skip = useCallback(
    (delta: 1 | -1) => {
      const before = clockRef.current
      const next = skipClock(before, delta, performance.now(), tracks.length)
      setClock(next)
      // ⏮ restarted the same track: the embed has nothing new to load, so send it back to the start.
      if (next !== before && next.trackIndex === before.trackIndex) requestSeek(0)
    },
    [setClock, requestSeek, tracks.length],
  )

  const scrub = useCallback(
    (deltaSeconds: number) => {
      const c = clockRef.current
      const known = embedDurationRef.current
      // Until the embed has reported this track's real length (30 s for a preview), a scrub could overshoot it.
      if (known?.trackIndex !== c.trackIndex) return
      const now = performance.now()
      const target = Math.round(
        Math.min(Math.max(0, elapsedAt(c, now) + deltaSeconds), Math.max(0, known.seconds - SEEK_END_MARGIN_S)),
      )
      setClock(seekClock(c, target, now))
      requestSeek(target)
    },
    [setClock, requestSeek],
  )

  const reportEmbed = useCallback(
    (trackIndex: number, position: number, seconds: number) => {
      const known = embedDurationRef.current
      if (seconds > 0 && (known?.trackIndex !== trackIndex || known.seconds !== seconds)) {
        setEmbedDuration({ trackIndex, seconds })
      }
      const c = clockRef.current
      if (c.trackIndex !== trackIndex || c.status !== 'playing') return
      const now = performance.now()
      if (Math.abs(elapsedAt(c, now) - position) > DRIFT_S) setClock(seekClock(c, position, now))
    },
    [setClock, setEmbedDuration],
  )

  const followEmbed = useCallback(
    (playing: boolean) => {
      const c = clockRef.current
      if (c.status !== 'stopped' && (c.status === 'playing') !== playing) {
        setClock(toggleClock(c, performance.now(), tracks.length))
      }
    },
    [setClock, tracks.length],
  )

  // Auto-advance to the next track when the current one ends. (Only a non-empty list ever plays.)
  useEffect(() => {
    if (clock.status !== 'playing') return
    const remaining = duration - elapsedAt(clock, performance.now())
    const timer = window.setTimeout(() => {
      setClock(skipClock(clockRef.current, 1, performance.now(), tracks.length))
    }, Math.max(0, remaining * 1000))
    return () => window.clearTimeout(timer)
  }, [clock, duration, setClock, tracks.length])

  const value = useMemo<PlaybackValue>(
    () => ({
      status: clock.status,
      started: clock.status !== 'stopped',
      tracks,
      trackIndex: clock.trackIndex,
      track,
      duration,
      canScrub,
      getElapsed,
      toggle,
      skip,
      scrub,
      seekRequest,
      reportEmbed,
      followEmbed,
    }),
    [clock, tracks, track, duration, canScrub, getElapsed, toggle, skip, scrub, seekRequest, reportEmbed, followEmbed],
  )

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
}
