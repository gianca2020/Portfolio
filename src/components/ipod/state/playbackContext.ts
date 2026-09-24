import { createContext, useContext } from 'react'
import type { Track } from '../../../data/types'

/**
 * "Now Building" playback — the Play/Pause easter egg. Nothing actually plays;
 * tracks are things Giancarlo has built, with a running clock like the iPod's
 * Now Playing screen.
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
  /** 0–1, adjusted with the wheel on the Now Playing screen. */
  volume: number
  /** Seconds into the current track, computed live — poll it while rendering progress. */
  getElapsed: () => number
  toggle: () => void
  skip: (delta: 1 | -1) => void
  setVolume: (volume: number) => void
}

export const PlaybackContext = createContext<PlaybackValue | null>(null)

export function usePlayback(): PlaybackValue {
  const value = useContext(PlaybackContext)
  if (!value) throw new Error('usePlayback must be used inside <PlaybackProvider>')
  return value
}
