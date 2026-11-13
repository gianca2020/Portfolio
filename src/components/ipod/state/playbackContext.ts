import { createContext, useContext } from 'react'
import type { Track } from '../../../data/types'

/**
 * Now Playing — the Play/Pause easter egg: songs on repeat, with a running clock
 * like the iPod's Now Playing screen. The clock is the iPod's own; the sound comes
 * from Spotify's embed, which SpotifyPlayer keeps in step with this state.
 */
export type PlaybackStatus = 'stopped' | 'playing' | 'paused'

export interface PlaybackValue {
  status: PlaybackStatus
  /** True once Play has been pressed (shows the "Now Playing" menu row). */
  started: boolean
  tracks: Track[]
  trackIndex: number
  /**
   * The current track. An empty list switches the easter egg off: Play does nothing, so
   * playback never starts and nothing that reads this (Now Playing) is ever shown.
   */
  track: Track
  /**
   * Seconds in the current track: the length Spotify reports once its embed has
   * loaded the song (30 for a preview), until then the track's listed length.
   */
  duration: number
  /** True once the embed has reported the current track's real length; scrubbing waits for it. */
  canScrub: boolean
  /** Seconds into the current track, computed live — poll it while rendering progress. */
  getElapsed: () => number
  toggle: () => void
  skip: (delta: 1 | -1) => void
  /** Scrub `deltaSeconds` forward (or back) from the live position; the embed follows. */
  scrub: (deltaSeconds: number) => void
  /** The latest jump (a scrub, or ⏮ restarting a track) for the embed to carry out; `id` tells repeats apart. */
  seekRequest: { seconds: number; id: number } | null
  /** The embed's real position and length (seconds) for track `trackIndex`; the clock follows it. */
  reportEmbed: (trackIndex: number, position: number, duration: number) => void
  /** The embed was played or paused from its own controls (or refused to start): follow it. */
  followEmbed: (playing: boolean) => void
}

export const PlaybackContext = createContext<PlaybackValue | null>(null)

export function usePlayback(): PlaybackValue {
  const value = useContext(PlaybackContext)
  if (!value) throw new Error('usePlayback must be used inside <PlaybackProvider>')
  return value
}
