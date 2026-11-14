import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { portfolio } from '../../../data/portfolio'
import { PlaybackContext, type PlaybackValue } from './playbackContext'
import { elapsedAt, seekClock, skipClock, STOPPED_CLOCK, toggleClock, type Clock } from './playbackClock'

/** How far (s) the iPod clock may drift from the audio before it snaps back in step. */
const DRIFT_S = 1.5
/** Scrubbing stops this far (s) short of the end, so it never skips the track by itself. */
const SEEK_END_MARGIN_S = 1

type AudioDuration = { trackIndex: number; seconds: number } | null

/**
 * The sound behind Now Playing: one hidden <audio> element playing each song's
 * Apple Music preview, driven only by the click wheel. Every change to the clock
 * is applied to it straight away, inside the press that caused it, since
 * browsers only let audio start from a user gesture (after the first one, the
 * element may carry on by itself, e.g. into the next song).
 */

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const tracks = portfolio.nowPlaying
  const [clock, setClockState] = useState<Clock>(STOPPED_CLOCK)
  // The audio's length for one track; it no longer applies once the track changes.
  const [audioDuration, setAudioDurationState] = useState<AudioDuration>(null)

  // Live copies, so several presses or wheel steps before the next render build on each other.
  const clockRef = useRef(clock)
  const audioDurationRef = useRef(audioDuration)
  const setAudioDuration = useCallback((next: AudioDuration) => {
    audioDurationRef.current = next
    setAudioDurationState(next)
  }, [])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  /** The track the audio element has loaded. */
  const loadedRef = useRef<number | null>(null)
  /** Counts play() calls, so a refusal that arrives after a newer call is ignored. */
  const playCallRef = useRef(0)

  /**
   * Moves the clock and makes the audio follow: loads the clock's track, jumps to
   * `seekTo` seconds if given, and plays or pauses with it. A start the browser
   * refuses pauses the clock too, rather than run it in silence.
   */
  const setClock = useCallback(
    (next: Clock, seekTo?: number) => {
      clockRef.current = next
      setClockState(next)
      const track = tracks[next.trackIndex]
      if (!track || typeof Audio === 'undefined') return
      const audio = (audioRef.current ??= Object.assign(new Audio(), { preload: 'auto' }))
      if (loadedRef.current !== next.trackIndex) {
        loadedRef.current = next.trackIndex
        audio.src = track.previewUrl
      } else if (seekTo !== undefined) {
        audio.currentTime = seekTo
      }
      if (next.status !== 'playing') {
        playCallRef.current++
        audio.pause()
        return
      }
      const call = ++playCallRef.current
      audio.play().catch((error: unknown) => {
        // AbortError only means a newer load or pause overtook this play; and a
        // refusal from an older call says nothing about the newer one.
        if (call !== playCallRef.current) return
        if (!(error instanceof DOMException) || error.name !== 'NotAllowedError') return
        const c = clockRef.current
        if (c.status !== 'playing') return
        // The audio never started, so the clock only needs to stop too.
        clockRef.current = toggleClock(c, performance.now(), tracks.length)
        setClockState(clockRef.current)
      })
    },
    [tracks],
  )

  const track = tracks[clock.trackIndex]
  const canScrub = audioDuration?.trackIndex === clock.trackIndex
  const duration = canScrub ? audioDuration.seconds : (track?.duration ?? 0)

  const getElapsed = useCallback(() => elapsedAt(clockRef.current, performance.now()), [])

  const toggle = useCallback(() => {
    setClock(toggleClock(clockRef.current, performance.now(), tracks.length))
  }, [setClock, tracks.length])

  const skip = useCallback(
    (delta: 1 | -1) => {
      // ⏮ restarting the same track has nothing new to load, so it sends the audio back to the start.
      setClock(skipClock(clockRef.current, delta, performance.now(), tracks.length), 0)
    },
    [setClock, tracks.length],
  )

  const scrub = useCallback(
    (deltaSeconds: number) => {
      const c = clockRef.current
      const known = audioDurationRef.current
      // Until the audio has reported this track's real length, a scrub could overshoot it.
      if (known?.trackIndex !== c.trackIndex) return
      const now = performance.now()
      const target = Math.round(
        Math.min(Math.max(0, elapsedAt(c, now) + deltaSeconds), Math.max(0, known.seconds - SEEK_END_MARGIN_S)),
      )
      setClock(seekClock(c, target, now), target)
    },
    [setClock],
  )

  // Leaving the iPod silences it.
  useEffect(
    () => () => {
      const audio = audioRef.current
      audioRef.current = null
      loadedRef.current = null
      if (!audio) return
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    },
    [],
  )

  // Keep the clock on the audio's real length and position (it may buffer, or start late).
  useEffect(() => {
    const audio = audioRef.current
    if (clock.status === 'stopped' || !audio) return
    const onDuration = () => {
      const trackIndex = loadedRef.current
      if (trackIndex === null || !Number.isFinite(audio.duration) || audio.duration <= 0) return
      const known = audioDurationRef.current
      if (known?.trackIndex !== trackIndex || known.seconds !== audio.duration) {
        setAudioDuration({ trackIndex, seconds: audio.duration })
      }
    }
    const onTime = () => {
      const c = clockRef.current
      if (c.status !== 'playing' || c.trackIndex !== loadedRef.current || audio.paused) return
      const now = performance.now()
      if (Math.abs(elapsedAt(c, now) - audio.currentTime) > DRIFT_S) {
        clockRef.current = seekClock(c, audio.currentTime, now)
        setClockState(clockRef.current)
      }
    }
    onDuration()
    audio.addEventListener('durationchange', onDuration)
    audio.addEventListener('timeupdate', onTime)
    return () => {
      audio.removeEventListener('durationchange', onDuration)
      audio.removeEventListener('timeupdate', onTime)
    }
  }, [clock.status, setAudioDuration])

  // The browser's and the OS's media controls (keyboard media keys, lock screen) work the iPod too.
  useEffect(() => {
    if (!track || clock.status === 'stopped' || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: track.artwork.image ? [{ src: track.artwork.image, sizes: '600x600' }] : [],
    })
  }, [track, clock.status])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const session = navigator.mediaSession
    const actions: [MediaSessionAction, () => void][] = [
      ['play', () => clockRef.current.status !== 'playing' && toggle()],
      ['pause', () => clockRef.current.status === 'playing' && toggle()],
      ['nexttrack', () => skip(1)],
      ['previoustrack', () => skip(-1)],
    ]
    for (const [action, handler] of actions) session.setActionHandler(action, handler)
    return () => {
      for (const [action] of actions) session.setActionHandler(action, null)
    }
  }, [toggle, skip])

  // Auto-advance to the next track when the current one ends. (Only a non-empty list ever plays.)
  useEffect(() => {
    if (clock.status !== 'playing') return
    const remaining = duration - elapsedAt(clock, performance.now())
    const timer = window.setTimeout(() => {
      setClock(skipClock(clockRef.current, 1, performance.now(), tracks.length), 0)
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
    }),
    [clock, tracks, track, duration, canScrub, getElapsed, toggle, skip, scrub],
  )

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
}
