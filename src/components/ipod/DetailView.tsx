import { useCallback, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type UIEvent } from 'react'
import { ActionList } from './detail/ActionList'
import { describeActionRow } from './detail/actions'
import { ContentBlock } from './detail/ContentBlock'
import { actionAt, computeStops, indexOfAction, revealTop, scrollTopFor, syncIndexForScroll } from './detail/stops'
import type { ActionBlock, ContentBlock as ContentBlockType, DetailBlock } from './detail/types'
import { Scrollbar } from './Scrollbar'
import type { ScreenNode, ScreenProps } from './types'
import { useScreenController } from './useScreenController'
import './screens.css'

// The screen is wheel-driven, and native scrolling needs no focus either: a press
// must not move focus off the wheel onto the scroller, which is unmounted on Back.
const keepFocus = (event: MouseEvent) => event.preventDefault()

export interface DetailViewProps extends ScreenProps<ScreenNode> {
  blocks: DetailBlock[]
}

const isAction = (block: DetailBlock): block is ActionBlock => block.type === 'action'

/**
 * Generic scrolling detail screen (iPod "Notes"-style reading + action rows).
 *
 * The wheel first steps through the text in 48px stops, then highlights the
 * action rows, which always sit together after the content. Native scrolling
 * (mouse wheel, trackpad, touch) works too and silently syncs the wheel index.
 * See detail/stops.ts for the maths.
 */
export function DetailView({ node, blocks, index, active, api }: DetailViewProps) {
  const { content, actions } = useMemo(
    () => ({
      content: blocks.filter((b): b is ContentBlockType => !isAction(b)),
      actions: blocks.filter(isAction),
    }),
    [blocks],
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLLIElement | null)[]>([])
  const [size, setSize] = useState({ scrollHeight: 0, clientHeight: 0 })
  const [scrollTop, setScrollTop] = useState(0)

  const stops = useMemo(
    () => computeStops(size.scrollHeight - size.clientHeight, actions.length),
    [size, actions.length],
  )
  const highlighted = actionAt(stops, index)

  // Latest values for the scroll handler, which runs outside render.
  const live = useRef({ index, stops })
  useLayoutEffect(() => {
    live.current = { index, stops }
  })

  useLayoutEffect(() => {
    const el = scrollRef.current
    const inner = contentRef.current
    if (!el || !inner) return
    const measure = () =>
      setSize((prev) =>
        prev.scrollHeight === el.scrollHeight && prev.clientHeight === el.clientHeight
          ? prev
          : { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight },
      )
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  useScreenController(api, active, {
    count: stops.count,
    onSelect: (i) => {
      const row = actionAt(stops, i)
      if (row >= 0) api.runAction(actions[row].action)
    },
    // Reading positions have nothing to add to the engine's "position n of N".
    describe: (i) => describeActionRow(actions, actionAt(stops, i)),
  })

  /* Feedback-loop guards: `programmatic` is the scrollTop we just set (its scroll
   * event must not re-sync the index); `userSynced` is the index a native scroll
   * just reported (its index change must not snap the view back to a stop). */
  const programmatic = useRef<number | null>(null)
  const userSynced = useRef<number | null>(null)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Consumed on every run, so a marker from a no-op setIndex can't outlive the next change.
    const fromUser = userSynced.current === index
    userSynced.current = null
    if (fromUser) return

    const row = actionAt(stops, index)
    const rowEl = row >= 0 ? rowRefs.current[row] : null
    const target = rowEl
      ? revealTop(el.scrollTop, el.clientHeight, rowEl.offsetTop, rowEl.offsetHeight)
      : scrollTopFor(stops, index)
    if (Math.abs(el.scrollTop - target) < 1) return
    const before = el.scrollTop
    el.scrollTop = target
    // Record what the browser actually applied (it may clamp); no change means no scroll event.
    if (el.scrollTop !== before) programmatic.current = el.scrollTop
    setScrollTop(el.scrollTop)
  }, [index, stops])

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const top = event.currentTarget.scrollTop
    setScrollTop(top)
    const expected = programmatic.current
    programmatic.current = null
    if ((expected !== null && Math.abs(top - expected) < 1) || !active) return
    const next = syncIndexForScroll(live.current.stops, live.current.index, top)
    if (next === null) return
    userSynced.current = next
    api.setIndex(next, { silent: true })
  }

  const rowRef = useCallback((row: number, el: HTMLLIElement | null) => {
    rowRefs.current[row] = el
  }, [])
  // An outgoing (sliding-out) screen's rows must not drive the incoming screen's controller.
  const onRowClick = useCallback(
    (row: number) => {
      if (active) api.selectIndex(indexOfAction(stops, row))
    },
    [active, api, stops],
  )

  // Content never changes while scrolling; keep it out of the per-scroll re-render.
  const renderedContent = useMemo(
    () => content.map((block, i) => <ContentBlock key={i} block={block} />),
    [content],
  )
  const overflowing = stops.maxScroll > 0

  return (
    <section aria-label={node.title} className="absolute inset-0 overflow-hidden bg-lcd font-ipod text-lcd-ink">
      {/* tabIndex -1: browsers that make scrollers keyboard-focusable would otherwise put this
          unnamed box (its focus ring clipped) before the wheel in the Tab order. The mousedown
          handler only keeps focus where it is; it is not an interaction a key would need. */}
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onMouseDown={keepFocus}
        tabIndex={-1}
        className="lcd-scroll absolute inset-0"
      >
        <div
          ref={contentRef}
          data-overflow={overflowing ? 'true' : 'false'}
          className={`detail-content ${actions.length ? '' : 'pb-[6px]'}`}
        >
          {renderedContent}
          {actions.length > 0 && (
            <ActionList actions={actions} highlighted={highlighted} onRowClick={onRowClick} rowRef={rowRef} />
          )}
        </div>
      </div>
      <Scrollbar
        total={size.scrollHeight}
        visible={size.clientHeight}
        offset={scrollTop}
        className="pointer-events-none"
      />
    </section>
  )
}
