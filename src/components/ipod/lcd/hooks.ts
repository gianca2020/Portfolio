import { useReducedMotion } from 'framer-motion'
import { useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { SettingsContext } from '../state/settingsContext'
import { marqueeShift, marqueeTimeline } from './marquee'
import { nextWindowStart } from './menuWindow'

/**
 * Effective reduced-motion preference: the iPod's Reduce Motion setting when
 * rendered inside <SettingsProvider>, else the OS preference (so covers stay
 * usable on their own, e.g. in the design-system bundle).
 */
export function useLcdReducedMotion(): boolean {
  const settings = useContext(SettingsContext)
  const system = useReducedMotion() ?? false
  return settings ? settings.reducedMotion : system
}

/** A document-unique id that is safe inside `url(#…)` references (no colons). */
export function useSvgId(prefix = 'lcd'): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}

/**
 * First visible row of a scrolling list. Remembers the previous window so the
 * highlight reaches an edge before the list moves (see nextWindowStart).
 */
export function useWindowStart(index: number, count: number, visible: number): number {
  const [start, setStart] = useState(() => nextWindowStart(0, index, count, visible))
  const next = nextWindowStart(start, index, count, visible)
  // Adjusting state while rendering is React's documented pattern for derived state.
  if (next !== start) setStart(next)
  return next
}

/** Layout effect in the browser; a plain effect when prerendering (static markup, tests), where neither runs. */
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * iPod marquee for a one-line label clipped by its box (see lcd/marquee.ts).
 * While `run`, a label wider than its box scrolls to show its end, then snaps
 * back, over and over. `on` tells the box to clip instead of drawing an
 * ellipsis, and the text to become an inline-block so it can move.
 */
export function useMarquee<T extends HTMLElement>(run: boolean, label: string) {
  const boxRef = useRef<T>(null)
  const textRef = useRef<T>(null)
  const [shift, setShift] = useState(0)

  // Measured before paint, so a label that needs the marquee never flashes its ellipsis first.
  useBrowserLayoutEffect(() => {
    const box = boxRef.current
    const text = textRef.current
    if (!run || !box || !text) return
    let live = true
    const measure = () => {
      if (!live) return
      setShift(marqueeShift(text.getBoundingClientRect().width, box.getBoundingClientRect().width, box.clientWidth))
    }
    measure()
    // A web font arriving late changes the label's width.
    void document.fonts.ready.then(measure)
    return () => {
      live = false
    }
  }, [run, label])

  const on = run && shift > 0
  useEffect(() => {
    const text = textRef.current
    if (!on || !text) return
    const { keyframes, duration } = marqueeTimeline(shift)
    const animation = text.animate(keyframes, { duration, iterations: Infinity })
    return () => animation.cancel()
  }, [on, shift])

  return { boxRef, textRef, on }
}
