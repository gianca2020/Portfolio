import type { MouseEvent } from 'react'
import { ChevronIcon, Glyph } from '../icons'
import type { MenuAction } from '../types'
import { actionHint } from './actions'
import type { ActionBlock } from './types'

/** Small ↗ for rows that leave the iPod (new tab / mail app). */
function ExternalArrow() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true" className="h-[9px] w-[9px] shrink-0">
      <path d="M2.5 7.5 7.5 2.5M3.6 2.5h3.9v3.9" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

const opensExternally = (action: MenuAction) => action.type === 'open-url'

// Rows are driven by the wheel/keyboard; a pointer press must not park focus on
// one (Enter on a focused button would activate it instead of the highlight).
const keepFocus = (event: MouseEvent) => event.preventDefault()

export interface ActionListProps {
  actions: ActionBlock[]
  /** Highlighted row, or -1. */
  highlighted: number
  onRowClick: (row: number) => void
  rowRef: (row: number, el: HTMLLIElement | null) => void
}

/** Menu-like action rows (GitHub, Live Site, Download…) at the end of a detail screen. */
export function ActionList({ actions, highlighted, onRowClick, rowRef }: ActionListProps) {
  return (
    <ul aria-label="Actions" className="detail-bleed mt-[8px] border-t border-lcd-rule">
      {actions.map((row, i) => {
        const on = i === highlighted
        const extra = actionHint(row.action)
        return (
          <li key={`${row.label}-${i}`} ref={(el) => rowRef(i, el)} aria-current={on ? 'true' : undefined}>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={keepFocus}
              onClick={(event) => {
                // Ignore the rest of a multi-click: no second download, and no row
                // activated on the screen the first click just opened.
                if (event.detail > 1) return
                onRowClick(i)
              }}
              className={`flex h-[25px] w-full cursor-pointer items-center gap-[6px] pr-[7px] pl-[8px] text-left text-[15px] leading-[25px] font-semibold ${on ? 'lcd-selected' : 'text-lcd-ink'}`}
            >
              {row.icon && <Glyph icon={row.icon} className="h-[14px] w-[14px] shrink-0" />}
              {/* The detail has a zero flex-basis: it only takes leftover space and gives way
                  first, while an over-long label still truncates instead of overflowing. */}
              <span className="min-w-0 truncate">{row.label}</span>
              <span
                className={`min-w-0 flex-1 truncate text-right text-[11px] font-normal ${on ? '' : 'text-lcd-ink-3'}`}
              >
                {row.detail}
              </span>
              {extra && <span className="sr-only">({extra})</span>}
              {opensExternally(row.action) ? (
                <ExternalArrow />
              ) : (
                <ChevronIcon aria-hidden="true" className="h-[11px] w-[11px] shrink-0" />
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
