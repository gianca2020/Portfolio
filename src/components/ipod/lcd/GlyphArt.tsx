import type { ReactNode } from 'react'
import type { PreviewIcon } from '../types'

/**
 * Pictograms on a 24 × 24 grid, drawn as solid shapes (they read at 14px in a
 * detail row and at 64px on a placeholder panel). `shape` paints with the given
 * fill — currentColor or a gloss gradient; `cut` is knocked out of it through a
 * mask (black removes, white restores), so details stay transparent whatever the paint.
 */
interface Art {
  shape: (paint: string) => ReactNode
  cut?: ReactNode
}

const round = (n: number) => Math.round(n * 100) / 100

/** An 8-tooth gear outline around (12, 12). */
function gearPath(teeth = 8, outer = 11, inner = 8.2): string {
  const points: string[] = []
  const step = (Math.PI * 2) / teeth
  const at = (r: number, a: number) => `${round(12 + r * Math.cos(a))} ${round(12 + r * Math.sin(a))}`
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2
    points.push(at(inner, a - 0.3), at(outer, a - 0.19), at(outer, a + 0.19), at(inner, a + 0.3))
  }
  return `M${points.join('L')}Z`
}

const GEAR = gearPath()

const cutStroke = { fill: 'none', stroke: '#000', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** GitHub mark (Octicons, MIT), scaled from its 16px grid. */
const GITHUB =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z'

const ART: Record<PreviewIcon, Art> = {
  github: {
    shape: (paint) => <path d={GITHUB} fill={paint} transform="translate(1 1) scale(1.375)" />,
  },
  linkedin: {
    shape: (paint) => <rect x="2" y="2" width="20" height="20" rx="3.5" fill={paint} />,
    cut: (
      <>
        <circle cx="7.4" cy="7.2" r="1.65" fill="#000" />
        <rect x="6" y="9.9" width="2.8" height="8.3" fill="#000" />
        <path
          d="M10.9 9.9h2.7v1.2c.5-.8 1.5-1.45 2.9-1.45 2.3 0 3.4 1.45 3.4 4.05v4.5h-2.8v-4c0-1.2-.4-2.05-1.55-2.05-1.2 0-1.95.85-1.95 2.2v3.85h-2.7z"
          fill="#000"
        />
      </>
    ),
  },
  mail: {
    shape: (paint) => <rect x="2" y="5" width="20" height="14.5" rx="2.2" fill={paint} />,
    cut: <path d="M3.4 6.6 12 13.2l8.6-6.6" strokeWidth="1.9" {...cutStroke} />,
  },
  download: {
    shape: (paint) => (
      <>
        <path d="M10.6 2.5h2.8v8.3h3.7L12 16.2l-5.1-5.4h3.7z" fill={paint} />
        <path d="M2.8 14.4v4.8a2 2 0 0 0 2 2h14.4a2 2 0 0 0 2-2v-4.8h-2.6v4.2H5.4v-4.2z" fill={paint} />
      </>
    ),
  },
  document: {
    shape: (paint) => (
      <path
        d="M6.5 1.8H14l5.6 5.6v13.1a1.7 1.7 0 0 1-1.7 1.7H6.5a1.7 1.7 0 0 1-1.7-1.7V3.5a1.7 1.7 0 0 1 1.7-1.7z"
        fill={paint}
      />
    ),
    cut: (
      <>
        <path d="M13.9 2v5.5h5.5" strokeWidth="1.3" {...cutStroke} />
        <path d="M8 12h8M8 15h8M8 18h5.2" strokeWidth="1.5" {...cutStroke} />
      </>
    ),
  },
  recruiter: {
    shape: (paint) => (
      <>
        <circle cx="12" cy="7.4" r="4.4" fill={paint} />
        <path d="M3.4 21.6c0-5 3.9-8.1 8.6-8.1s8.6 3.1 8.6 8.1z" fill={paint} />
      </>
    ),
  },
  external: {
    shape: (paint) => (
      <g fill="none" stroke={paint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 4.5h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" />
        <path d="M14 3.6h6.4V10M20 4l-8.6 8.6" />
      </g>
    ),
  },
  settings: {
    shape: (paint) => <path d={GEAR} fill={paint} />,
    cut: <circle cx="12" cy="12" r="3.4" fill="#000" />,
  },
  sound: {
    shape: (paint) => (
      <>
        <path d="M2.6 9h3.8l5.1-4.4v14.8l-5.1-4.4H2.6z" fill={paint} />
        <path
          d="M14.8 8.8a4.4 4.4 0 0 1 0 6.4M17.6 6a8.4 8.4 0 0 1 0 12"
          fill="none"
          stroke={paint}
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      </>
    ),
  },
  /** Chassis finish: a tiny iPod — screen over click wheel. */
  theme: {
    shape: (paint) => <rect x="5.4" y="1.4" width="13.2" height="21.2" rx="2.6" fill={paint} />,
    cut: (
      <>
        <rect x="7.4" y="3.4" width="9.2" height="7" rx="0.8" fill="#000" />
        <circle cx="12" cy="16.3" r="4" fill="#000" />
        <circle cx="12" cy="16.3" r="1.45" fill="#fff" />
      </>
    ),
  },
  motion: {
    shape: (paint) => (
      <>
        <circle cx="15" cy="12" r="6.6" fill={paint} />
        <path d="M2.6 8.4h4.2M1.6 12h4.2M2.6 15.6h4.2" stroke={paint} strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  info: {
    shape: (paint) => <circle cx="12" cy="12" r="10.4" fill={paint} />,
    cut: (
      <>
        <circle cx="12" cy="7.2" r="1.75" fill="#000" />
        <rect x="10.55" y="10.2" width="2.9" height="8" rx="0.7" fill="#000" />
      </>
    ),
  },
}

/** The shapes of one pictogram (to be placed inside a 24 × 24 viewBox). */
export function GlyphArt({ icon, paint, id }: { icon: PreviewIcon; paint: string; id: string }) {
  const art = ART[icon] ?? ART.info
  if (!art.cut) return <>{art.shape(paint)}</>
  const maskId = `${id}-cut`
  return (
    <>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#fff" />
        {art.cut}
      </mask>
      <g mask={`url(#${maskId})`}>{art.shape(paint)}</g>
    </>
  )
}
