import type { CSSProperties, MouseEvent } from 'react'
import { ChevronIcon } from './icons'
import { useLcdReducedMotion, useMarquee } from './lcd/hooks'
import { useDeviceActive } from './state/deviceContext'

export type MenuItemTrailing =
  /** › chevron: the row opens another screen. */
  | { type: 'chevron' }
  /** Right-aligned value, e.g. Settings "Sound  On". */
  | { type: 'value'; text: string }
  | { type: 'none' }

export interface MenuItemProps {
  /** DOM id (for aria-activedescendant). */
  id: string
  label: string
  highlighted: boolean
  trailing: MenuItemTrailing
  /** Pointer click on the row: highlight + select. */
  onClick: () => void
  /** Placement inside the list; the menu positions rows absolutely (default: a 24px block row). */
  style?: CSSProperties
}

// Rows are driven by the wheel / keyboard; a pointer press must not park focus
// on one (focusing a clipped row would also scroll the list out of register).
const keepFocus = (event: MouseEvent) => event.preventDefault()

/**
 * One menu row: Helvetica Bold 16 in black, ink 6px from the left edge, cap top
 * 6px / baseline 17px into the 24–25px row. The highlighted row is the blue
 * selection bar with white type. Trailing: a › for rows that open a screen
 * (grey, white when highlighted) or a setting's value. A label too long for
 * its row ends in an ellipsis; once highlighted it marquees instead (still
 * ellipsised under reduced motion).
 */
export function MenuItem({ id, label, highlighted, trailing, onClick, style }: MenuItemProps) {
  const reducedMotion = useLcdReducedMotion()
  const deviceActive = useDeviceActive()
  const canScroll = highlighted && !reducedMotion && deviceActive
  const { boxRef, textRef, on: marquee } = useMarquee<HTMLSpanElement>(canScroll, label)

  // The extra clicks of a double-click (detail > 1) would act again: select the row twice, or the row
  // of the screen that just slid in under the pointer. Keyboard-synthesised clicks have detail 0.
  const onRowClick = (event: MouseEvent) => {
    if (event.detail <= 1) onClick()
  }

  return (
    // A native <option> can't hold this layout (value column, chevron), so this is an ARIA
    // listbox option. The keyboard is global (useIPodEngine: ↑/↓ move, Enter/→ select), so
    // rows need no key handlers of their own.
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events
    <div id={id} role="option"
      aria-selected={highlighted}
      tabIndex={-1}
      onMouseDown={keepFocus}
      onClick={onRowClick}
      style={style}
      className={`flex h-[24px] cursor-pointer items-center pr-[7px] pl-[5px] text-[16px] font-bold ${
        highlighted ? 'lcd-selected' : 'text-lcd-ink'
      }`}
    >
      <span
        ref={boxRef}
        className={`min-w-0 flex-1 overflow-hidden leading-[20px] whitespace-nowrap ${
          marquee ? '' : 'text-ellipsis'
        }`}
      >
        <span ref={textRef} className={marquee ? 'inline-block' : undefined}>
          {label}
        </span>
      </span>
      {trailing.type === 'value' && <span className="ml-[8px] shrink-0 leading-[20px]">{trailing.text}</span>}
      {trailing.type === 'chevron' && (
        <ChevronIcon className={`ml-[6px] h-[13px] w-[8px] shrink-0 ${highlighted ? '' : 'text-lcd-ink-3'}`} />
      )}
    </div>
  )
}
