import { useEffect, useState } from 'react'
import type { ArtworkSpec } from '../../../../data/types'
import { Artwork } from '../../Artwork'
import { useDeviceActive } from '../../state/deviceContext'
import { usePlayback } from '../../state/playbackContext'
import { Crossfade } from '../Crossfade'
import { useLcdReducedMotion } from '../hooks'
import { cycleItem, kenBurnsVars, PREVIEW_FADE_MS, SLIDE_FADE_MS, SLIDE_INTERVAL_MS } from '../motion'
import { Caption } from './Caption'

/** One full-bleed cover filling the 160 × 240 panel, drifting in the n-th Ken Burns direction. */
function DriftingCover({ artwork, n, still }: { artwork: ArtworkSpec; n: number; still: boolean }) {
  return (
    <div className="absolute inset-0" style={kenBurnsVars(n)}>
      <Artwork spec={artwork} kenBurns={!still} format="portrait" className="h-full w-full" />
    </div>
  )
}

export interface SlideshowProps {
  artworks: ArtworkSpec[]
  title?: string
  caption?: string
}

/**
 * The 6G main-menu look: full-bleed covers slowly panning and zooming, a new
 * one dissolving in every few seconds. Under reduced motion: the first cover, still.
 * While the device is hidden the show holds its current cover.
 */
export function Slideshow({ artworks, title, caption }: SlideshowProps) {
  const still = useLcdReducedMotion()
  const deviceActive = useDeviceActive()
  const [n, setN] = useState(0)
  const cycling = !still && artworks.length > 1

  useEffect(() => {
    if (!cycling || !deviceActive) return
    const timer = window.setInterval(() => setN((i) => i + 1), SLIDE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [cycling, deviceActive])

  const slide = cycling ? n : 0
  return (
    <div className="absolute inset-0 overflow-hidden bg-lcd-ink">
      <Crossfade
        itemKey={String(slide)}
        value={slide}
        durationMs={SLIDE_FADE_MS}
        instant={still}
        render={(i) => {
          const artwork = cycleItem(artworks, i)
          return artwork ? <DriftingCover artwork={artwork} n={i} still={still} /> : null
        }}
      />
      <Caption title={title} caption={caption} />
    </div>
  )
}

/** A single full-bleed cover with an optional caption. */
export function CoverArt({ artwork, title, caption }: { artwork: ArtworkSpec; title?: string; caption?: string }) {
  const still = useLcdReducedMotion()
  return (
    <div className="absolute inset-0 overflow-hidden bg-lcd-ink">
      <DriftingCover artwork={artwork} n={0} still={still} />
      <Caption title={title} caption={caption} />
    </div>
  )
}

/** The current "Now Building" track: its cover (dissolving on skips), title and album. */
export function NowPlayingArt() {
  const { track } = usePlayback()
  const still = useLcdReducedMotion()
  return (
    <div className="absolute inset-0 overflow-hidden bg-lcd-ink">
      <Crossfade
        itemKey={track.id}
        value={track.artwork}
        durationMs={PREVIEW_FADE_MS * 3}
        instant={still}
        render={(artwork) => <DriftingCover artwork={artwork} n={1} still={still} />}
      />
      <Caption title={track.title} caption={track.album} />
    </div>
  )
}
