import { useMemo } from 'react'
import type { ArtworkSpec } from '../../../data/types'
import { useSvgId } from './hooks'
import {
  COVER_LAYOUT,
  MONOGRAM,
  monogramSize,
  motifShapes,
  type CoverFormat,
  type Ink,
  type MotifShape,
} from './motifs'

function Shape({ shape, colors }: { shape: MotifShape; colors: Record<Ink, string> }) {
  const color = colors[shape.ink]
  switch (shape.kind) {
    case 'rect':
      return (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.w}
          height={shape.h}
          rx={shape.rx}
          fill={color}
          opacity={shape.opacity}
        />
      )
    case 'circle':
      return shape.stroke ? (
        <circle
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill="none"
          stroke={color}
          strokeWidth={shape.stroke}
          opacity={shape.opacity}
        />
      ) : (
        <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill={color} opacity={shape.opacity} />
      )
    case 'ellipse':
      return (
        <ellipse
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          transform={`rotate(${shape.rotate} ${shape.cx} ${shape.cy})`}
          fill="none"
          stroke={color}
          strokeWidth={shape.stroke}
          opacity={shape.opacity}
        />
      )
  }
}

/**
 * Album-sleeve cover drawn from a palette, a motif and a monogram. Fills its
 * box (cropped to cover, like `object-fit: cover`).
 */
export function GeneratedCover({ spec, format = 'square' }: { spec: ArtworkSpec; format?: CoverFormat }) {
  const id = useSvgId('cover')
  const { height, baseline } = COVER_LAYOUT[format]
  const [bg, fg, accent] = spec.palette
  const shapes = useMemo(() => motifShapes(spec.motif), [spec.motif])
  const size = monogramSize(spec.monogram)

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <defs>
        {/* Printed-sleeve light: a touch brighter at the top, a touch deeper at the foot. */}
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.14" />
        </linearGradient>
      </defs>
      <rect width="100" height={height} fill={bg} />
      {shapes.map((shape, i) => (
        <Shape key={i} shape={shape} colors={{ bg, fg, accent }} />
      ))}
      <text
        x={MONOGRAM.x}
        y={baseline}
        fill={fg}
        fontFamily="Helvetica, Arimo, Arial, sans-serif"
        fontWeight={700}
        fontSize={size}
        letterSpacing={MONOGRAM.tracking * size}
      >
        {spec.monogram}
      </text>
      <rect width="100" height={height} fill={`url(#${id}-sheen)`} />
    </svg>
  )
}
