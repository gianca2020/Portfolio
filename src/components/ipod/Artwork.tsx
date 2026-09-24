import { useState } from 'react'
import type { ArtworkSpec } from '../../data/types'
import { GeneratedCover } from './lcd/GeneratedCover'
import { useLcdReducedMotion } from './lcd/hooks'
import type { CoverFormat } from './lcd/motifs'
import { useDeviceActive } from './state/deviceContext'
import './lcd.css'

export interface ArtworkProps {
  spec: ArtworkSpec
  className?: string
  /** Slow Ken Burns pan/zoom (disabled automatically under reduced motion). */
  kenBurns?: boolean
  /** Layout of a generated cover: 'portrait' for 2 : 3 boxes such as the split-view panel. */
  format?: CoverFormat
}

/**
 * Square album-style cover that fills its className box: `spec.image` when set
 * (falling back to the generated cover if it fails to load), else a generated
 * sleeve. The Ken Burns drift runs on an inner layer, so the box itself never
 * moves; its direction and zoom can be tuned with the --kb-* custom properties
 * on any ancestor (see lcd/motion.ts). The drift holds still while the device is hidden.
 */
export function Artwork({ spec, className = '', kenBurns = false, format = 'square' }: ArtworkProps) {
  const reducedMotion = useLcdReducedMotion()
  const deviceActive = useDeviceActive()
  const drifting = kenBurns && !reducedMotion
  // Remember which URL failed, so a different image (e.g. the next track's) still gets a try.
  const [failedSrc, setFailedSrc] = useState<string>()
  const photo = spec.image && spec.image !== failedSrc ? spec.image : undefined
  const described = !!photo && !!spec.imageAlt

  // Block-level spans: covers also sit inside buttons (Cover Flow), which only admit phrasing content.
  return (
    <span className={`block overflow-hidden ${className}`} aria-hidden={described ? undefined : true}>
      <span
        className={`block h-full w-full ${drifting ? 'lcd-kenburns' : ''}`}
        style={drifting && !deviceActive ? { animationPlayState: 'paused' } : undefined}
      >
        {photo ? (
          <img
            src={photo}
            alt={spec.imageAlt ?? ''}
            draggable={false}
            onError={() => setFailedSrc(photo)}
            className="block h-full w-full object-cover"
          />
        ) : (
          <GeneratedCover spec={spec} format={format} />
        )}
      </span>
    </span>
  )
}
