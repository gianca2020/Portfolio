import { Glyph } from '../../icons'
import type { PreviewIcon } from '../../types'
import { fitFontSize } from '../textMetrics'

export interface SlatePanelProps {
  icon: PreviewIcon
  /** Caption under the glyph; shrinks (18px down to 13px) to fit on one line. */
  title: string
  detail?: string
  hint?: string
  /** Largest caption size: 18px for names, larger for a setting's value read-out. */
  titleMax?: number
}

/** Caption box: the 160px panel less 8px each side. */
const CAPTION_WIDTH = 144
/** Vertical centre of the caption line (the firmware sets it at ≈ y 166–182). */
const CAPTION_CENTRE = 174

/**
 * The firmware's "no artwork" panel: slate gradient, a large glossy white
 * glyph in the upper half and a white caption beneath it.
 */
export function SlatePanel({ icon, title, detail, hint, titleMax = 18 }: SlatePanelProps) {
  const size = fitFontSize(title, CAPTION_WIDTH, { max: titleMax, min: 13 })
  const lineHeight = Math.max(24, size + 6)
  const detailTop = Math.max(187, CAPTION_CENTRE + lineHeight / 2)
  return (
    <div className="lcd-slate lcd-slate-text absolute inset-0 text-center">
      <Glyph icon={icon} glossy className="lcd-glossy absolute top-[67px] left-[48px] h-[64px] w-[64px]" />
      <p
        className="absolute inset-x-[8px] truncate font-bold"
        style={{ top: CAPTION_CENTRE - lineHeight / 2, fontSize: size, lineHeight: `${lineHeight}px` }}
      >
        {title}
      </p>
      {detail && (
        <p
          className="absolute inset-x-[10px] line-clamp-2 text-[11px] leading-[14px] text-white/90"
          style={{ top: detailTop }}
        >
          {detail}
        </p>
      )}
      {hint && (
        <p className="absolute inset-x-[10px] bottom-[9px] truncate text-[10px] leading-[12px] text-white/90">{hint}</p>
      )}
    </div>
  )
}
