import { useId, type CSSProperties, type ReactNode } from 'react'
import './chassis.css'
import { DEVICE_MM } from './constants'
import type { ChassisTheme } from './state/settingsContext'

export interface ChassisProps {
  theme: ChassisTheme
  /** The LCD (bezel window + display), placed in the upper portion. */
  screen: ReactNode
  /** The click wheel, placed in the lower portion. */
  wheel: ReactNode
}

const round = (n: number) => Math.round(n * 1000) / 1000
const mm = (n: number) => `calc(var(--u) * ${round(n)})`

const { width: W, height: H, cornerRadius, window: glass, wheel: disc, bevel } = DEVICE_MM

const DEVICE_STYLE = { width: mm(W), height: mm(H), '--plate-corner': mm(cornerRadius) } as CSSProperties
const SCREEN_STYLE: CSSProperties = {
  left: mm(glass.x),
  top: mm(glass.y),
  width: mm(glass.width),
  height: mm(glass.height),
}
const WHEEL_STYLE: CSSProperties = {
  left: mm(disc.cx - disc.diameter / 2),
  top: mm(disc.cy - disc.diameter / 2),
  width: mm(disc.diameter),
  height: mm(disc.diameter),
}

/*
 * The flat of the front plate; the bevel band shows around it. The band is
 * 4.7 mm wide beside the screen and widens to 7.7 mm below it (the flat there
 * is 46.4 mm wide with ≈4.9 mm corners), tapering with a short S-curve. The
 * flat's gradient spans the whole plate and follows the plate's own a shade
 * lighter, so the band reads as a faint roll-off rather than a raised panel.
 */
const TOP = bevel.aroundScreen
const LOW = bevel.belowScreen
const FLAT_TOP_RADIUS = glass.radius + (glass.x - TOP) // concentric with the window
const FLAT_LOW_RADIUS = 4.9
const TAPER_START = glass.y + glass.height + (glass.x - TOP)
const TAPER = 5.6
const TAPER_END = TAPER_START + TAPER
const TAPER_MID = TAPER_START + TAPER / 2
/** Softens the flat's edge into the band, reading as curvature rather than a step (mm). */
const BEVEL_SOFTNESS = 0.85

const FLAT_FACE = [
  ['M', TOP + FLAT_TOP_RADIUS, TOP],
  ['H', W - TOP - FLAT_TOP_RADIUS],
  ['A', FLAT_TOP_RADIUS, FLAT_TOP_RADIUS, 0, 0, 1, W - TOP, TOP + FLAT_TOP_RADIUS],
  ['V', TAPER_START],
  ['C', W - TOP, TAPER_MID, W - LOW, TAPER_MID, W - LOW, TAPER_END],
  ['V', H - LOW - FLAT_LOW_RADIUS],
  ['A', FLAT_LOW_RADIUS, FLAT_LOW_RADIUS, 0, 0, 1, W - LOW - FLAT_LOW_RADIUS, H - LOW],
  ['H', LOW + FLAT_LOW_RADIUS],
  ['A', FLAT_LOW_RADIUS, FLAT_LOW_RADIUS, 0, 0, 1, LOW, H - LOW - FLAT_LOW_RADIUS],
  ['V', TAPER_END],
  ['C', LOW, TAPER_MID, TOP, TAPER_MID, TOP, TAPER_START],
  ['V', TOP + FLAT_TOP_RADIUS],
  ['A', FLAT_TOP_RADIUS, FLAT_TOP_RADIUS, 0, 0, 1, TOP + FLAT_TOP_RADIUS, TOP],
  ['Z'],
]
  .map(([command, ...args]) => [command, ...args.map((n) => round(Number(n)))].join(' '))
  .join(' ')

/** The flat of the plate, drawn in device millimetres over the bevel gradient. */
function PlateFace() {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      className="ipod__face"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-flat`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
          <stop offset="0" style={{ stopColor: 'var(--plate-flat-top)' }} />
          <stop offset="0.45" style={{ stopColor: 'var(--plate-flat-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--plate-flat-low)' }} />
        </linearGradient>
        <filter id={`${id}-soften`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={BEVEL_SOFTNESS} />
        </filter>
      </defs>
      <path d={FLAT_FACE} fill={`url(#${id}-flat)`} filter={`url(#${id}-soften)`} />
    </svg>
  )
}

/**
 * The front of the iPod: bead-blasted anodised aluminium with a bevelled edge,
 * the black glass window in the upper portion and the click wheel below.
 * Laid out in millimetres of the real device via `--u` (px per mm).
 */
export function Chassis({ theme, screen, wheel }: ChassisProps) {
  return (
    <section className="ipod" aria-label="iPod classic" data-finish={theme} style={DEVICE_STYLE}>
      <PlateFace />
      <div className="ipod__grain" aria-hidden="true" />
      <div className="ipod__slot" style={SCREEN_STYLE}>
        {screen}
      </div>
      <div className="ipod__slot" style={WHEEL_STYLE}>
        {wheel}
      </div>
    </section>
  )
}
