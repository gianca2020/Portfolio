import { useEffect, useState } from 'react'
import type { ArtworkSpec } from '../../data/types'
import { Artwork } from './Artwork'
import {
  ART_QUAD,
  describeTrack,
  formatClock,
  formatRemaining,
  PROGRESS_TICK_MS,
  progressOf,
  quadMatrix,
  SCRUB_STEP_S,
  scrubSteps,
} from './detail/nowPlaying'
import { useDeviceActive } from './state/deviceContext'
import { usePlayback } from './state/playbackContext'
import type { ScreenNode, ScreenProps } from './types'
import { useScreenController } from './useScreenController'
import './screens.css'

/** Artwork box before the keystone transform; ART_QUAD sets its size on screen. */
const ART = 120
const REFLECTION = 28
const ART_TRANSFORM = `matrix3d(${quadMatrix(ART, ART_QUAD).join(', ')})`

// The text column starts 11px right of the art's right (receding) edge and is centred on its height.
const [, [ART_RIGHT, ART_RIGHT_TOP], [, ART_RIGHT_BOTTOM]] = ART_QUAD
const TEXT_LEFT = ART_RIGHT + 11

/** Cover in the firmware's keystone, with the mirrored reflection fading out beneath it. */
function ReflectedArtwork({ spec }: { spec: ArtworkSpec }) {
  return (
    <div
      className="absolute top-0 left-0"
      style={{ width: ART, transformOrigin: '0 0', transform: ART_TRANSFORM }}
    >
      <div className="ring-1 ring-lcd-rule" style={{ width: ART, height: ART }}>
        <Artwork spec={spec} className="h-full w-full" />
      </div>
      <div aria-hidden="true" className="lcd-reflection mt-[1px]" style={{ width: ART, height: REFLECTION }}>
        <div style={{ width: ART, height: ART }}>
          <Artwork spec={spec} className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}

/** Inset 9px track with the firmware's blue progress fill. */
function Meter({ fraction }: { fraction: number }) {
  return (
    <div className="np-track relative h-[9px] flex-1 overflow-hidden border">
      <div className="np-fill absolute inset-y-0 left-0" style={{ width: `${fraction * 100}%` }} />
    </div>
  )
}

/** The 6th-generation Now Playing screen, driven by the playback easter egg. */
export function NowPlaying({ node, active, api }: ScreenProps<ScreenNode>) {
  const playback = usePlayback()
  const deviceActive = useDeviceActive()
  const { status, track, trackIndex, tracks, duration } = playback
  const playing = status === 'playing'

  // Re-render ~4×/s while playing and on screen so the clock and bar advance. The
  // clock is timestamp-based, so it is right again as soon as the device reappears.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!playing || !deviceActive) return
    const timer = window.setInterval(() => setTick((t) => t + 1), PROGRESS_TICK_MS)
    return () => window.clearInterval(timer)
  }, [playing, deviceActive])

  useScreenController(api, active, {
    count: 1,
    // The wheel scrubs through the song (Spotify's embed has no volume control to drive).
    // scrub() works from the live clock, so quick successive steps build on each other.
    onMove: (delta, source) => {
      if (!playback.canScrub) return true
      playback.scrub(scrubSteps(delta, source) * SCRUB_STEP_S)
      api.click()
      return true
    },
    onSkip: (delta) => {
      playback.skip(delta)
      return true
    },
    onSelect: () => {},
    // Spoken by the engine on ⏮ / ⏭, auto-advance and every scrub step.
    describe: () => describeTrack(track, Math.min(playback.getElapsed(), duration), duration),
  })

  const elapsed = Math.min(playback.getElapsed(), duration)

  return (
    <section aria-label={node.title} className="absolute inset-0 overflow-hidden bg-lcd font-ipod text-lcd-ink">
      <p
        className="absolute top-[4px] right-[8px] text-[11px] leading-[14px] text-lcd-ink-2"
        style={{ left: TEXT_LEFT }}
      >
        {trackIndex + 1} of {tracks.length}
      </p>

      <ReflectedArtwork spec={track.artwork} />

      <div
        className="absolute right-[8px] flex flex-col justify-center"
        style={{ top: ART_RIGHT_TOP, left: TEXT_LEFT, height: ART_RIGHT_BOTTOM - ART_RIGHT_TOP }}
      >
        <h2 className="truncate text-[14px] leading-[18px] font-bold">{track.title}</h2>
        <p className="truncate text-[12px] leading-[16px]">{track.artist}</p>
        <p className="truncate text-[12px] leading-[16px] text-lcd-ink-2">{track.album}</p>
      </div>

      <div className="absolute right-[14px] bottom-[9px] left-[14px] h-[26px]">
        <div className="flex">
          <Meter fraction={progressOf(elapsed, duration)} />
        </div>
        <div className="mt-[3px] flex items-baseline justify-between text-[11px] leading-[14px] text-lcd-ink-2">
          <span>{formatClock(elapsed)}</span>
          {!playing && <span className="font-semibold text-lcd-ink-3">Paused</span>}
          <span>{formatRemaining(elapsed, duration)}</span>
        </div>
      </div>
    </section>
  )
}
