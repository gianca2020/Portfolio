import { useId } from 'react'
import { LCD_HEIGHT, MENU_VISIBLE_ROWS, SCREEN_HEIGHT, SPLIT_PANEL_WIDTH, STATUS_BAR_HEIGHT } from './constants'
import { getVisibleChildren, opensScreen } from './data'
import { useWindowStart } from './lcd/hooks'
import { rowHeight, rowTop } from './lcd/menuWindow'
import { MenuItem, type MenuItemTrailing } from './MenuItem'
import { clampIndex } from './navigation'
import { Preview } from './Preview'
import { Scrollbar } from './Scrollbar'
import { useSettings } from './state/settingsContext'
import { usePlayback } from './state/playbackContext'
import type { IPodNode, MenuNode, ScreenProps } from './types'
import './lcd.css'

/** Width the 6G scrollbar takes from the rows when a list overflows. */
const SCROLLBAR_WIDTH = 7

interface MenuListProps {
  title: string
  rows: IPodNode[]
  highlighted: number
  /** Pointer selection; ignored while the menu slides out. */
  onRowClick: (index: number) => void
}

/**
 * The list itself: up to nine 24/25px rows in the 220px area under the status
 * bar. Longer lists scroll one row at a time once the highlight reaches an edge.
 * Every row stays in the DOM (off-window rows are clipped) so assistive tech
 * sees the whole menu.
 */
function MenuList({ title, rows, highlighted, onRowClick }: MenuListProps) {
  const { describe } = useSettings()
  const idBase = useId()
  const start = useWindowStart(highlighted, rows.length, MENU_VISIBLE_ROWS)
  const scrolls = rows.length > MENU_VISIBLE_ROWS

  const trailingFor = (row: IPodNode): MenuItemTrailing => {
    if (row.kind === 'setting') return { type: 'value', text: describe(row.setting) }
    return opensScreen(row) ? { type: 'chevron' } : { type: 'none' }
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* A native <select> can't draw the iPod list; this is the ARIA listbox pattern. Not focusable:
          the keyboard is global and the engine's live region announces the highlight. */}
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <div role="listbox" aria-label={title} className="absolute inset-0">
        {rows.map((row, i) => (
          <MenuItem
            key={row.id}
            id={`${idBase}-${i}`}
            label={row.label}
            highlighted={i === highlighted}
            trailing={trailingFor(row)}
            onClick={() => onRowClick(i)}
            style={{
              position: 'absolute',
              left: 0,
              right: scrolls ? SCROLLBAR_WIDTH : 0,
              top: rowTop(i - start),
              height: rowHeight(i - start),
            }}
          />
        ))}
      </div>
      {scrolls && <Scrollbar total={rows.length} visible={MENU_VISIBLE_ROWS} offset={start} />}
    </div>
  )
}

/**
 * A menu screen. 'full': a 320px list. 'split': the classic 6G main-menu
 * layout — a 160px list on white casting a shadow onto a full-height preview
 * of the highlighted row, which runs up behind the (half-width) status bar.
 */
export function MenuScreen({ node, index, active, api }: ScreenProps<MenuNode>) {
  const { started } = usePlayback()
  const rows = getVisibleChildren(node, started)
  const highlighted = clampIndex(index, rows.length)
  const current = rows[highlighted] as IPodNode | undefined

  const onRowClick = (i: number) => {
    if (active) api.selectIndex(i)
  }
  const list = <MenuList title={node.title} rows={rows} highlighted={highlighted} onRowClick={onRowClick} />

  if (node.layout !== 'split') return <div className="absolute inset-0 bg-lcd font-ipod">{list}</div>

  // Both halves span the full LCD height: y = -20 is the top of the canvas.
  const panel = { top: -STATUS_BAR_HEIGHT, width: SPLIT_PANEL_WIDTH, height: LCD_HEIGHT }
  return (
    <div className="absolute inset-0 font-ipod">
      <div className="absolute" style={{ ...panel, left: SPLIT_PANEL_WIDTH }}>
        <Preview spec={current?.preview} label={current?.label ?? node.title} />
      </div>
      <div className="lcd-split-panel absolute left-0 z-10 bg-lcd" style={panel}>
        <div className="absolute inset-x-0" style={{ top: STATUS_BAR_HEIGHT, height: SCREEN_HEIGHT }}>
          {list}
        </div>
      </div>
    </div>
  )
}
