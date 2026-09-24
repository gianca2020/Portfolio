import type { SVGProps } from 'react'
import { GlyphArt } from './lcd/GlyphArt'
import { useSvgId } from './lcd/hooks'
import type { PreviewIcon } from './types'

type IconProps = SVGProps<SVGSVGElement>

/*
 * LCD glyphs. Each fills its className box through its viewBox; all are
 * decorative (aria-hidden). The status-bar glyphs carry their own firmware
 * colours; everything else draws with currentColor.
 */

// Token names are written out in full: Tailwind only emits theme variables it finds in the source.
const PLAY_EDGE = { stopColor: 'var(--color-play-edge)' }
const PLAY_CORE = { stopColor: 'var(--color-play-core)' }
const BATTERY_HI = { stopColor: 'var(--color-battery-hi)' }
const BATTERY_TOP = { stopColor: 'var(--color-battery-top)' }
const BATTERY_BOTTOM = { stopColor: 'var(--color-battery-bottom)' }

/** Navy → cyan → navy, top to bottom, plus a darker left edge: the status bar's play/pause paint. */
function StatusPaint({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-v`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={PLAY_EDGE} />
        <stop offset="0.4" style={PLAY_CORE} />
        <stop offset="0.6" style={PLAY_CORE} />
        <stop offset="1" style={PLAY_EDGE} />
      </linearGradient>
      <linearGradient id={`${id}-h`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" style={PLAY_EDGE} stopOpacity="0.7" />
        <stop offset="0.35" style={PLAY_EDGE} stopOpacity="0" />
      </linearGradient>
    </defs>
  )
}

/** Shades a shape with the status paint (both gradients are relative to each shape's own box). */
function StatusShape({ id, d }: { id: string; d: string }) {
  return (
    <>
      <path d={d} fill={`url(#${id}-v)`} />
      <path d={d} fill={`url(#${id}-h)`} />
    </>
  )
}

/** Status bar ▶: 11 × 12. */
export function PlayIcon(props: IconProps) {
  const id = useSvgId('play')
  return (
    <svg viewBox="0 0 11 12" aria-hidden="true" {...props}>
      <StatusPaint id={id} />
      <StatusShape id={id} d="M0 0 11 6 0 12Z" />
    </svg>
  )
}

/** Status bar ❚❚: two bars in the play glyph's 11 × 12 box. */
export function PauseIcon(props: IconProps) {
  const id = useSvgId('pause')
  return (
    <svg viewBox="0 0 11 12" aria-hidden="true" {...props}>
      <StatusPaint id={id} />
      <StatusShape id={id} d="M1 0h3.6v12H1z" />
      <StatusShape id={id} d="M6.4 0H10v12H6.4z" />
    </svg>
  )
}

/**
 * Status bar idle ▷, before anything has played: the play triangle as a dimmed
 * outline, so the bar keeps its playback glyph without claiming to be paused.
 */
export function IdleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 11 12" aria-hidden="true" {...props}>
      <path
        d="M.75.95 9.85 6 .75 11.05Z"
        fill="none"
        strokeWidth="1.3"
        strokeLinejoin="round"
        opacity="0.6"
        style={{ stroke: 'var(--color-play-edge)' }}
      />
    </svg>
  )
}

/**
 * Status bar battery (full charge): 24 × 12 body with a 1px outline whose corner
 * pixels are softened, a glossy green cell, a 2 × 4 terminal nub and a faint
 * 1px emboss beneath. 26 × 13 overall.
 */
export function BatteryIcon(props: IconProps) {
  const id = useSvgId('battery')
  const outline = { fill: 'var(--color-battery-outline)' }
  return (
    <svg viewBox="0 0 26 13" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={`${id}-cell`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={BATTERY_HI} />
          <stop offset="0.3" style={BATTERY_HI} />
          <stop offset="0.42" style={BATTERY_TOP} />
          <stop offset="1" style={BATTERY_BOTTOM} />
        </linearGradient>
      </defs>
      <path d="M1 0h22v1H1zM1 11h22v1H1zM0 1h1v10H0zM23 1h1v10h-1z" style={outline} />
      <path d="M0 0h1v1H0zM23 0h1v1h-1zM0 11h1v1H0zM23 11h1v1h-1z" style={outline} opacity="0.35" />
      <rect x="1" y="1" width="22" height="10" fill={`url(#${id}-cell)`} />
      <rect x="24" y="4" width="2" height="4" style={{ fill: 'var(--color-bar-bottom)' }} />
      <rect x="1" y="12" width="22" height="1" fill="#ffffff" opacity="0.55" />
    </svg>
  )
}

/** The › on rows that open another screen: 8 × 13, heavy stroke, round ends. */
export function ChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 8 13" aria-hidden="true" {...props}>
      <path
        d="M1.35 1.35 6.5 6.5 1.35 11.65"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export interface GlyphProps extends IconProps {
  icon: PreviewIcon
  /** White-to-silver gloss instead of currentColor (placeholder panels). */
  glossy?: boolean
}

/** Pictogram for an info preview, a setting read-out or a detail action row. */
export function Glyph({ icon, glossy = false, ...props }: GlyphProps) {
  const id = useSvgId('glyph')
  const paint = glossy ? `url(#${id}-gloss)` : 'currentColor'
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" data-icon={icon} {...props}>
      {glossy && (
        <defs>
          <linearGradient id={`${id}-gloss`} gradientUnits="userSpaceOnUse" x1="0" y1="1.5" x2="0" y2="22.5">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.48" stopColor="#ffffff" />
            <stop offset="0.53" stopColor="#e6edf3" />
            <stop offset="1" stopColor="#c3cfda" />
          </linearGradient>
        </defs>
      )}
      <GlyphArt icon={icon} paint={paint} id={id} />
    </svg>
  )
}
