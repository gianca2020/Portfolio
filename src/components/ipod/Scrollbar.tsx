import { scrollbarThumb } from './lcd/menuWindow'
import './lcd.css'

/**
 * The 6th-generation list scrollbar: a 7px light-grey track with a 1px darker
 * outline on the right edge, and a solid dark-grey thumb inset 1px inside it,
 * sized to the visible fraction (never shorter than 10px). Purely visual
 * (aria-hidden); the list itself carries the semantics. Renders nothing when
 * everything fits.
 */
export interface ScrollbarProps {
  /** Total content size (rows or px). */
  total: number
  /** Visible size, same unit as `total`. */
  visible: number
  /** Offset of the first visible unit, same unit as `total`. */
  offset: number
  className?: string
}

const MIN_THUMB = '10px'

export function Scrollbar({ total, visible, offset, className = '' }: ScrollbarProps) {
  const thumb = scrollbarThumb(total, visible, offset)
  if (!thumb) return null
  // Travel is the track's inner height minus the 1px inset above and below the thumb.
  const height = `max(${MIN_THUMB}, calc((100% - 2px) * ${thumb.size}))`
  const top = `calc(1px + (100% - 2px - ${height}) * ${thumb.position})`

  return (
    <div aria-hidden="true" className={`lcd-scrollbar absolute top-0 right-0 bottom-0 w-[7px] ${className}`}>
      <div className="lcd-scrollbar__thumb absolute right-[1px] left-[1px]" style={{ top, height }} />
    </div>
  )
}
