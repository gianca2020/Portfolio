import { useState } from 'react'
import { Artwork } from '../Artwork'
import type { HeroBlock } from './types'

const FIGURE = 'h-[72px] w-[72px] shrink-0 overflow-hidden'

/** Initials on a neutral grey gradient — the "no photo" contact tile. */
function Monogram({ initials }: { initials: string }) {
  return (
    <div
      aria-hidden="true"
      className={`${FIGURE} flex items-center justify-center border border-lcd-rule bg-linear-to-b from-lcd-wash to-lcd-rule text-[26px] leading-none font-bold tracking-[0.5px] text-lcd-ink-2`}
    >
      {initials}
    </div>
  )
}

function Photo({ src, initials, name }: { src?: string; initials: string; name: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <Monogram initials={initials} />
  return (
    <img
      src={src}
      alt={`Portrait of ${name}`}
      onError={() => setFailed(true)}
      className={`${FIGURE} border border-lcd-rule object-cover`}
    />
  )
}

/** Line widths (px) of the résumé thumbnail's sections, each under a short dark rule. */
const DOC_SECTIONS = [
  [38, 34, 36],
  [38, 30, 36],
  [26, 32],
]

/** A tiny paper page with a folded corner, like a PDF document icon. */
function DocumentThumb() {
  return (
    <div aria-hidden="true" className={`${FIGURE} flex items-center justify-center`}>
      <div className="relative h-[70px] w-[54px] border border-lcd-rule bg-lcd px-[7px] pt-[7px] shadow-[0_1px_2px_rgb(0_0_0/0.22)]">
        <span className="absolute top-[-1px] right-[-1px] h-[10px] w-[10px] border-b border-l border-lcd-rule bg-linear-to-bl from-lcd from-50% to-lcd-wash to-50%" />
        <span className="mb-[4px] block h-[3px] w-[24px] bg-lcd-ink-2" />
        {DOC_SECTIONS.map((lines, s) => (
          <div key={s} className="mb-[3px]">
            <span className="mb-[2px] block h-[2px] w-[14px] bg-lcd-ink-3" />
            {lines.map((width, i) => (
              <span key={i} className="mb-[2px] block h-[2px] bg-lcd-rule" style={{ width }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Figure({ block }: { block: HeroBlock }) {
  if (block.document) return <DocumentThumb />
  if (block.photo) return <Photo src={block.photo.src} initials={block.photo.initials} name={block.title} />
  if (block.artwork) {
    return (
      <div className={`${FIGURE} border border-lcd-rule`}>
        <Artwork spec={block.artwork} className="h-full w-full" />
      </div>
    )
  }
  return null
}

/** Top of a detail screen: square figure at left, then title / subtitle / meta. */
export function Hero({ block }: { block: HeroBlock }) {
  return (
    <div className="flex items-start gap-[10px] px-[8px] pt-[8px] pb-[6px]">
      <Figure block={block} />
      <div className="min-w-0 flex-1 pt-[1px]">
        <h2 className="line-clamp-2 text-[15px] leading-[18px] font-bold">{block.title}</h2>
        {block.subtitle && (
          <p className="mt-[2px] line-clamp-3 text-[12px] leading-[15px] text-lcd-ink-2">{block.subtitle}</p>
        )}
        {block.meta && <p className="mt-[3px] text-[11px] leading-[14px] text-lcd-ink-3">{block.meta}</p>}
      </div>
    </div>
  )
}
