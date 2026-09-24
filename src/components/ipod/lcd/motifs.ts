import type { ArtworkMotif } from '../../../data/types'
import { fitFontSize } from './textMetrics'

/**
 * Generated cover art on a 100 × 100 grid: one restrained motif in the upper
 * part of the sleeve, the monogram set large in the lower left. Everything is
 * computed from the motif alone — no randomness — so a cover renders the same
 * on every visit, in every size.
 */

/** Which palette colour a shape uses: [background, foreground, accent]. */
export type Ink = 'bg' | 'fg' | 'accent'

export type MotifShape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx?: number; ink: Ink; opacity: number }
  | { kind: 'circle'; cx: number; cy: number; r: number; ink: Ink; opacity: number; stroke?: number }
  | {
      kind: 'ellipse'
      cx: number
      cy: number
      rx: number
      ry: number
      rotate: number
      ink: Ink
      opacity: number
      stroke: number
    }

const r2 = (n: number) => Math.round(n * 100) / 100

/** Voice / audio: a centred band of rounded bars under a soft envelope. */
function waveform(): MotifShape[] {
  const count = 29
  const left = 8
  const step = 84 / count
  const width = 1.7
  const mid = 32
  return Array.from({ length: count }, (_, i) => {
    const wave = Math.abs(0.55 * Math.sin(i * 0.62) + 0.45 * Math.sin(i * 0.21 + 0.8))
    const envelope = Math.sin((Math.PI * (i + 0.5)) / count) ** 0.6
    const h = 3 + 34 * wave * envelope
    return {
      kind: 'rect',
      x: r2(left + i * step + (step - width) / 2),
      y: r2(mid - h / 2),
      w: width,
      h: r2(h),
      rx: width / 2,
      ink: 'accent',
      opacity: 0.92,
    }
  })
}

/** Returns / finance: a rising column chart on a baseline, the last column in the accent. */
function bars(): MotifShape[] {
  const heights = [11, 17, 14, 23, 30, 40]
  const base = 50
  const left = 48
  const width = 5.4
  const gap = 2.2
  const columns: MotifShape[] = heights.map((h, i) => ({
    kind: 'rect',
    x: r2(left + i * (width + gap)),
    y: base - h,
    w: width,
    h,
    ink: i === heights.length - 1 ? 'accent' : 'fg',
    opacity: i === heights.length - 1 ? 1 : 0.82,
  }))
  const span = heights.length * (width + gap) - gap
  return [...columns, { kind: 'rect', x: left, y: base + 1.2, w: r2(span), h: 0.8, ink: 'fg', opacity: 0.55 }]
}

/** Structure: a Swiss square grid with an accent diagonal stepping down from the top right. */
function grid(): MotifShape[] {
  const cols = 6
  const rows = 4
  const size = 6.2
  const gap = 2.8
  const left = 92 - cols * size - (cols - 1) * gap
  const top = 9
  const shapes: MotifShape[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lit = col + row === cols - 1
      shapes.push({
        kind: 'rect',
        x: r2(left + col * (size + gap)),
        y: r2(top + row * (size + gap)),
        w: size,
        h: size,
        ink: lit ? 'accent' : 'fg',
        opacity: lit ? 1 : 0.16,
      })
    }
  }
  return shapes
}

/** Systems: nested orbits seen at an angle, a core and one accent body on the outer path. */
function orbit(): MotifShape[] {
  const cx = 64
  const cy = 30
  const rotate = -18
  const radii: [number, number][] = [
    [11, 4.5],
    [21, 8.5],
    [31, 12.5],
  ]
  const rings: MotifShape[] = radii.map(([rx, ry], i) => ({
    kind: 'ellipse',
    cx,
    cy,
    rx,
    ry,
    rotate,
    ink: 'fg',
    opacity: 0.22 + i * 0.06,
    stroke: 0.9,
  }))
  // A point on the outer ellipse, rotated with it.
  const [rx, ry] = radii[radii.length - 1]
  const t = (200 * Math.PI) / 180
  const rot = (rotate * Math.PI) / 180
  const px = rx * Math.cos(t)
  const py = ry * Math.sin(t)
  return [
    ...rings,
    { kind: 'circle', cx, cy, r: 3.4, ink: 'fg', opacity: 0.9 },
    {
      kind: 'circle',
      cx: r2(cx + px * Math.cos(rot) - py * Math.sin(rot)),
      cy: r2(cy + px * Math.sin(rot) + py * Math.cos(rot)),
      r: 2.6,
      ink: 'accent',
      opacity: 1,
    },
  ]
}

/** Institution / pace: full-width bands thinning towards the monogram. */
function stripes(): MotifShape[] {
  const thickness = [8, 6, 4.4, 3, 2, 1.2]
  const gap = 2.6
  let y = 10
  return thickness.map((h, i) => {
    const shape: MotifShape = { kind: 'rect', x: 0, y: r2(y), w: 100, h, ink: 'accent', opacity: r2(1 - i * 0.12) }
    y += h + gap
    return shape
  })
}

/** A record: fine grooves, an accent label and the spindle hole, cropped by the sleeve's edge. */
function rings(): MotifShape[] {
  const cx = 70
  const cy = 32
  const grooves: MotifShape[] = []
  for (let r = 13; r <= 40; r += 4.5) {
    grooves.push({ kind: 'circle', cx, cy, r, ink: 'fg', opacity: r2(0.14 + (40 - r) * 0.004), stroke: 0.8 })
  }
  return [
    ...grooves,
    { kind: 'circle', cx, cy, r: 9, ink: 'accent', opacity: 1 },
    { kind: 'circle', cx, cy, r: 1.4, ink: 'bg', opacity: 1 },
  ]
}

const MOTIFS: Record<ArtworkMotif, () => MotifShape[]> = { waveform, bars, grid, orbit, stripes, rings }

/** Shapes for a motif (unknown motifs draw nothing but the monogram). */
export function motifShapes(motif: ArtworkMotif): MotifShape[] {
  return MOTIFS[motif]?.() ?? []
}

/** Monogram placement: left-aligned at x = 8 on a baseline at y = 90, as large as fits. */
export const MONOGRAM = { x: 8, baseline: 90, width: 84, tracking: -0.02 } as const

/**
 * 'square' is the sleeve; 'portrait' (2 : 3) is the same sleeve extended
 * downwards for the full-height split-view panel, so nothing is cropped and the
 * monogram sits clear of the caption at the foot.
 */
export type CoverFormat = 'square' | 'portrait'

export const COVER_LAYOUT: Record<CoverFormat, { height: number; baseline: number }> = {
  square: { height: 100, baseline: MONOGRAM.baseline },
  portrait: { height: 150, baseline: 100 },
}

export function monogramSize(monogram: string): number {
  return fitFontSize(monogram, MONOGRAM.width, { max: 46, min: 16, tracking: MONOGRAM.tracking })
}
