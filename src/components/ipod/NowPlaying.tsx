import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ArtworkSpec } from '../../data/types'
import { Artwork } from './Artwork'
import {
  ART_QUAD,
  describeTrack,
  formatClock,
  formatRemaining,
  nextVolume,
  PROGRESS_TICK_MS,
  progressOf,
  quadMatrix,
  VOLUME_HUD_MS,
  volumeSteps,
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

function Speaker({ loud }: { loud?: boolean }) {
  return (
    <svg viewBox="0 0 14 12" aria-hidden="true" className="h-[10px] w-[12px] shrink-0 text-lcd-ink-2">
      <path d="M1 4h2.5L7 1v10L3.5 8H1z" fill="currentColor" />
      {loud && <path d="M9 3.5a3.5 3.5 0 0 1 0 5M10.8 1.8a6 6 0 0 1 0 8.4" fill="none" stroke="currentColor" />}
    </svg>
  )
}

/** "Now Building" — the 6th-generation Now Playing screen, driven by the playback easter egg. */
export function NowPlaying({ node, active, api }: ScreenProps<ScreenNode>) {
  const playback = usePlayback()
  const deviceActive = useDeviceActive()
  const { status, track, trackIndex, tracks, volume } = playback
  const playing = status === 'playing'

  // Re-render ~4×/s while playing and on screen so the clock and bar advance. The
  // clock is timestamp-based, so it is right again as soon as the device reappears.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!playing || !deviceActive) return
    const timer = window.setInterval(() => setTick((t) => t + 1), PROGRESS_TICK_MS)
    return () => window.clearInterval(timer)
  }, [playing, deviceActive])

  // Several wheel steps can land before the provider re-renders: track the volume locally.
  const volumeRef = useRef(volume)
  useLayoutEffect(() => {
    volumeRef.current = volume
  }, [volume])

  const [showVolume, setShowVolume] = useState(false)
  const hideTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  useScreenController(api, active, {
    count: 1,
    onMove: (delta, source) => {
      const next = nextVolume(volumeRef.current, volumeSteps(delta, source))
      if (next !== volumeRef.current) {
        volumeRef.current = next
        playback.setVolume(next)
        api.click()
      }
      setShowVolume(true)
      window.clearTimeout(hideTimer.current)
      hideTimer.current = window.setTimeout(() => setShowVolume(false), VOLUME_HUD_MS)
      return true
    },
    onSkip: (delta) => {
      playback.skip(delta)
      return true
    },
    onSelect: () => {},
    // Spoken by the engine on ⏮ / ⏭, auto-advance and every volume step.
    describe: () => describeTrack(track, volume),
  })

  const elapsed = Math.min(playback.getElapsed(), track.duration)

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
        {showVolume ? (
          <div className="flex h-[9px] items-center gap-[6px]">
            <Speaker />
            <Meter fraction={volume} />
            <Speaker loud />
          </div>
        ) : (
          <>
            <div className="flex">
              <Meter fraction={progressOf(elapsed, track.duration)} />
            </div>
            <div className="mt-[3px] flex items-baseline justify-between text-[11px] leading-[14px] text-lcd-ink-2">
              <span>{formatClock(elapsed)}</span>
              {!playing && <span className="font-semibold text-lcd-ink-3">Paused</span>}
              <span>{formatRemaining(elapsed, track.duration)}</span>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
