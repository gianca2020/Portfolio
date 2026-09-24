import type { CSSProperties } from 'react'
import { SLIDE_DURATION } from '../constants'

/** The firmware's menu sweep accelerates into place: slow start, abrupt stop. No spring. */
export const SLIDE_EASE: [number, number, number, number] = [0.4, 0, 0.8, 0.6]
export const SLIDE_EASE_CSS = `cubic-bezier(${SLIDE_EASE.join(', ')})`
export const SLIDE_MS = Math.round(SLIDE_DURATION * 1000)

/** Split-view preview: swaps almost immediately when the highlight moves. */
export const PREVIEW_FADE_MS = 130
/** Main-menu slideshow: a new cover every 5 s, dissolving in over 1.5 s. */
export const SLIDE_INTERVAL_MS = 5000
export const SLIDE_FADE_MS = 1500

/** Ken Burns pan: start and end offsets in % of the cover, applied before scaling. */
export interface KenBurnsPan {
  x0: number
  y0: number
  x1: number
  y1: number
}

/**
 * Pan directions cycled by the slideshow so consecutive covers drift differently.
 * At the minimum 1.08 zoom a cover overhangs 4% per side, so ≤ 2.5% never shows an edge.
 */
const PANS: KenBurnsPan[] = [
  { x0: -2, y0: 1.5, x1: 2, y1: -1.5 },
  { x0: 2, y0: -1, x1: -2, y1: 1.5 },
  { x0: -1.5, y0: -2, x1: 1.5, y1: 2 },
  { x0: 1.5, y0: 2, x1: -1.5, y1: -2 },
]

const wrap = (n: number, length: number) => ((n % length) + length) % length

export const kenBurnsPan = (n: number): KenBurnsPan => PANS[wrap(n, PANS.length)]

/** Item `n` of an endlessly cycling list (negative `n` wraps too); undefined when empty. */
export const cycleItem = <T>(items: readonly T[], n: number): T | undefined =>
  items.length ? items[wrap(n, items.length)] : undefined

export type KenBurnsStrength = 'full' | 'subtle'

const ZOOM: Record<KenBurnsStrength, { from: number; to: number; pan: number }> = {
  /** Slideshow / full-bleed covers: 1.08 → 1.18. */
  full: { from: 1.08, to: 1.18, pan: 1 },
  /** Covers with text beneath them (project, role): a gentler drift. */
  subtle: { from: 1.04, to: 1.1, pan: 0.5 },
}

/** CSS custom properties read by `.lcd-kenburns` (see lcd.css); set them on any ancestor of the cover. */
export function kenBurnsVars(n: number, strength: KenBurnsStrength = 'full'): CSSProperties {
  const { x0, y0, x1, y1 } = kenBurnsPan(n)
  const { from, to, pan } = ZOOM[strength]
  const pct = (v: number) => `${Math.round(v * pan * 100) / 100}%`
  return {
    '--kb-from': String(from),
    '--kb-to': String(to),
    '--kb-x0': pct(x0),
    '--kb-y0': pct(y0),
    '--kb-x1': pct(x1),
    '--kb-y1': pct(y1),
  } as CSSProperties
}
