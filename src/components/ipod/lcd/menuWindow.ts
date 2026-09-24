import { MENU_VISIBLE_ROWS, SCREEN_HEIGHT } from '../constants'

/**
 * First visible row of a list window, iPod style: the highlight walks to the
 * top or bottom edge first, then the list scrolls one row at a time to keep it
 * in view. Always clamped so the window never runs past either end.
 */
export function nextWindowStart(start: number, index: number, count: number, visible = MENU_VISIBLE_ROWS): number {
  const maxStart = Math.max(0, count - visible)
  let next = start
  if (index < next) next = index
  else if (index > next + visible - 1) next = index - visible + 1
  return Math.min(Math.max(next, 0), maxStart)
}

/**
 * Top edge (px) of the `slot`-th visible row. Rounding 220 / 9 per slot keeps
 * every row on whole pixels, alternating 24 / 25 px like the firmware; negative
 * slots place scrolled-off rows above the window.
 */
export const rowTop = (slot: number) => Math.round((slot * SCREEN_HEIGHT) / MENU_VISIBLE_ROWS)

/** Height (px) of the `slot`-th visible row: 24 or 25. */
export const rowHeight = (slot: number) => rowTop(slot + 1) - rowTop(slot)

export interface ScrollbarThumb {
  /** Thumb length as a fraction of the track (0–1]. */
  size: number
  /** Thumb position as a fraction of its travel (0–1). */
  position: number
}

/** Scrollbar thumb geometry, or null when everything fits (no scrollbar is drawn). */
export function scrollbarThumb(total: number, visible: number, offset: number): ScrollbarThumb | null {
  if (!(total > 0) || !(visible > 0) || total <= visible) return null
  const maxOffset = total - visible
  return {
    size: visible / total,
    position: Math.min(Math.max(offset / maxOffset, 0), 1),
  }
}
