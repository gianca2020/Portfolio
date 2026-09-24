import type { Track } from '../../../data/types'
import type { MoveSource } from '../types'

/** Now Playing ("Now Building") clock, volume and artwork maths. */

/** Volume change per wheel step. */
export const VOLUME_STEP = 0.05
/** How long the volume bar replaces the progress bar after the last wheel step (ms). */
export const VOLUME_HUD_MS = 1500
/** Progress refresh interval while playing (ms). */
export const PROGRESS_TICK_MS = 250

/** Whole seconds as "m:ss". */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** iPod-style remaining time: "-m:ss", always summing with the elapsed display to the duration. */
export const formatRemaining = (elapsed: number, duration: number) =>
  `-${formatClock(duration - Math.max(0, Math.floor(Math.min(elapsed, duration))))}`

/** Fraction of the track played, 0–1. */
export const progressOf = (elapsed: number, duration: number) =>
  duration > 0 ? Math.min(Math.max(elapsed / duration, 0), 1) : 0

/**
 * Volume steps for a highlight move (+1 = next row). Turning the wheel clockwise is louder, as on the iPod.
 * Keys follow the vertical wheel slider instead: ↑, → and a screen reader's increment are louder.
 */
export const volumeSteps = (delta: number, source: MoveSource) => (source === 'wheel' ? delta : -delta)

/** Volume after `delta` wheel steps, clamped to 0–1 and rounded to kill float drift. */
export const nextVolume = (volume: number, delta: number) =>
  Math.min(1, Math.max(0, Math.round((volume + delta * VOLUME_STEP) * 100) / 100))

/** Spoken words for the screen: "Duels by Giancarlo Forero, volume 60%". */
export const describeTrack = (track: Track, volume: number) =>
  `${track.title} by ${track.artist}, volume ${Math.round(volume * 100)}%`

export type Point = readonly [x: number, y: number]
/** Corners in order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = readonly [Point, Point, Point, Point]

/**
 * Where the 6G firmware draws Now Playing artwork, on the screen box below the
 * 20px status bar (320 × 240 grid: TL 9,33 · TR 145,43 · BR 145,162 · BL 9,167).
 * The right edge recedes, as if the cover were turned slightly away.
 */
export const ART_QUAD: Quad = [
  [9, 13],
  [145, 23],
  [145, 142],
  [9, 147],
]

/**
 * CSS matrix3d() values that map a `size` × `size` box (transform-origin 0 0)
 * exactly onto `quad`: the projective square-to-quad mapping (Heckbert, 1989).
 * Anything else in the transformed element, such as a reflection below the
 * cover, follows the same perspective.
 */
export function quadMatrix(size: number, [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]: Quad): number[] {
  const dx1 = x1 - x2
  const dx2 = x3 - x2
  const dx3 = x0 - x1 + x2 - x3
  const dy1 = y1 - y2
  const dy2 = y3 - y2
  const dy3 = y0 - y1 + y2 - y3
  const det = dx1 * dy2 - dx2 * dy1
  // Perspective terms; both are 0 for a parallelogram (a plain affine transform).
  const g = (dx3 * dy2 - dx2 * dy3) / det
  const h = (dx1 * dy3 - dx3 * dy1) / det
  const a = x1 - x0 + g * x1
  const b = x3 - x0 + h * x3
  const d = y1 - y0 + g * y1
  const e = y3 - y0 + h * y3
  // Column-major, as matrix3d() takes them.
  return [a / size, d / size, 0, g / size, b / size, e / size, 0, h / size, 0, 0, 1, 0, x0, y0, 0, 1]
}
