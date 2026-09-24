import type { Track } from '../../../data/types'
import type { PlaybackStatus } from './playbackContext'

/**
 * The device's single polite live region.
 *
 * Navigation is spoken by exactly one channel: the wheel slider's aria-valuetext
 * while the slider has focus, this region otherwise. The region only changes when
 * what it reports changes, so focus moving on or off the slider never re-announces
 * stale text. Play/pause is always spoken here, because the slider's value doesn't
 * carry it.
 */
export interface LiveRegion {
  /** Engine announcement the region last saw. */
  announcement: string
  /** Playback status the region last saw. */
  status: PlaybackStatus
  /** What the region says. */
  text: string
}

export interface LiveRegionInput {
  announcement: string
  status: PlaybackStatus
  /** Current track; only read when playback starts. */
  track: Track
  sliderFocused: boolean
}

export const initialLiveRegion = (announcement: string, status: PlaybackStatus): LiveRegion => ({
  announcement,
  status,
  text: '',
})

const playbackMessage = (status: PlaybackStatus, track: Track) =>
  status === 'playing' ? `Playing ${track.title}` : status === 'paused' ? 'Paused' : ''

/** Next region state; the same object when nothing it reports has changed. */
export function nextLiveRegion(region: LiveRegion, input: LiveRegionInput): LiveRegion {
  const { announcement, status, track, sliderFocused } = input
  // Play/pause wins over a navigation change in the same update (the first Play adds
  // the "Now Playing" row, which changes the menu's count).
  if (status !== region.status) return { announcement, status, text: playbackMessage(status, track) }
  if (announcement !== region.announcement) return { announcement, status, text: sliderFocused ? '' : announcement }
  return region
}
