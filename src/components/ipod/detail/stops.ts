/**
 * Scroll/selection maths for <DetailView> (iPod "Notes"-style reading).
 *
 * A detail screen's wheel positions are a run of fixed scroll stops followed by
 * one position per action row:
 *
 *   0 … scrollSteps − 1        scrollTop = i · STEP, nothing highlighted
 *   scrollSteps                scrollTop = maxScroll (the last stop always rests at the bottom)
 *   scrollSteps + 1 … count-1  action row (i − scrollSteps − 1) highlighted
 *
 * A remainder shorter than half a step is folded into the step before it, so a
 * detent moves the text STEP/2 … 1.5 · STEP px (well under the 220px view) and
 * never just a pixel or two. Only a screen that overflows by less than STEP/2
 * in total gets a single shorter step.
 */

/** Pixels scrolled per wheel step on the 320 × 240 grid. */
export const DETAIL_STEP = 48

export interface DetailStops {
  /** scrollHeight − clientHeight, never negative. */
  maxScroll: number
  /** Number of scroll stops after the top one. */
  scrollSteps: number
  actionCount: number
  /** Controller count: scroll stops + action rows. */
  count: number
}

export function computeStops(maxScroll: number, actionCount: number, step = DETAIL_STEP): DetailStops {
  const max = Math.max(0, Math.round(maxScroll))
  const full = Math.floor(max / step)
  const tail = max - full * step
  const scrollSteps = tail === 0 || (tail < step / 2 && full > 0) ? full : full + 1
  return { maxScroll: max, scrollSteps, actionCount, count: scrollSteps + 1 + actionCount }
}

/** Index of the highlighted action row at wheel position `index`, or -1 for a scroll stop. */
export function actionAt(stops: DetailStops, index: number): number {
  const row = index - stops.scrollSteps - 1
  return row >= 0 && row < stops.actionCount ? row : -1
}

/** Wheel position that highlights action row `row`. */
export const indexOfAction = (stops: DetailStops, row: number) => stops.scrollSteps + 1 + row

/** scrollTop for a scroll stop (action positions rest at the bottom). */
export function scrollTopFor(stops: DetailStops, index: number, step = DETAIL_STEP): number {
  const stop = Math.min(Math.max(index, 0), stops.scrollSteps)
  return stop === stops.scrollSteps ? stops.maxScroll : stop * step
}

/** Smallest scroll change that shows [top, top + height) entirely inside the viewport. */
export function revealTop(scrollTop: number, viewport: number, top: number, height: number): number {
  if (top < scrollTop) return top
  if (top + height > scrollTop + viewport) return Math.min(top, top + height - viewport)
  return scrollTop
}

/** Nearest scroll stop for a native (mouse wheel / touch) scroll position. */
export function indexForScrollTop(stops: DetailStops, scrollTop: number, step = DETAIL_STEP): number {
  if (stops.scrollSteps === 0) return 0
  // The last stop is at maxScroll, so "at the bottom" always means the last stop.
  if (scrollTop >= stops.maxScroll - 1) return stops.scrollSteps
  // The last step can be shorter or longer than `step`: compare the two stops around scrollTop.
  const below = Math.min(Math.max(Math.floor(scrollTop / step), 0), stops.scrollSteps)
  const above = Math.min(below + 1, stops.scrollSteps)
  const distance = (i: number) => Math.abs(scrollTopFor(stops, i, step) - scrollTop)
  return distance(above) <= distance(below) ? above : below
}

/**
 * Index to sync to after a native scroll, or null to leave it alone: unchanged,
 * or an action row is highlighted and the view still rests at the bottom (where
 * every action row is shown).
 */
export function syncIndexForScroll(stops: DetailStops, index: number, scrollTop: number): number | null {
  if (actionAt(stops, index) >= 0 && scrollTop >= stops.maxScroll - 1) return null
  const next = indexForScrollTop(stops, scrollTop)
  return next === index ? null : next
}
