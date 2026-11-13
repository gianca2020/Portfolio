import { useSyncExternalStore } from 'react'

/* ────────────────────────────────────────────────────────────────────────────
 * Wheel coach
 *
 * A brief first-visit tutorial: the page dims around the LCD and the click
 * wheel, and an animated dot traces the ring until the visitor scrolls once.
 * Until then other presses are held (they replay the hint instead). The first
 * scroll ends it for good in this browser; Settings › Wheel Tutorial replays it.
 *
 * Lives outside React so the engine's input handlers and `runMenuAction` can
 * reach it without threading props.
 * ──────────────────────────────────────────────────────────────────────────── */

export interface CoachState {
  active: boolean
  /** Bumped on every held press, so the hint can restart its animation. */
  nudges: number
}

/** What the engine does with an input while the coach may be showing. */
export type CoachVerdict = 'pass' | 'step' | 'hold'

/** Scrolling ends the coach (and still scrolls); anything else is held while it's up. */
export const coachIntercepts = (state: CoachState, input: 'move' | 'press'): CoachVerdict =>
  !state.active ? 'pass' : input === 'move' ? 'step' : 'hold'

const STORAGE_KEY = 'gf-ipod-portfolio:wheel-coach'

function hasCompleted(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === 'done'
  } catch {
    return false
  }
}

function saveCompleted() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'done')
  } catch {
    // Private mode / blocked storage: the hint just shows again next visit.
  }
}

export function createWheelCoach(initial: CoachState = { active: !hasCompleted(), nudges: 0 }) {
  let state = initial
  const listeners = new Set<() => void>()
  const set = (next: CoachState) => {
    state = next
    listeners.forEach((listener) => listener())
  }

  return {
    get: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    /** Show the hint (Settings › Wheel Tutorial). */
    start: () => set({ active: true, nudges: 0 }),
    /** The visitor scrolled: the hint has done its job. */
    step() {
      if (!state.active) return
      saveCompleted()
      set({ ...state, active: false })
    },
    /** A press while the hint is up: replay it instead of acting. */
    nudge() {
      if (state.active) set({ ...state, nudges: state.nudges + 1 })
    },
  }
}

export const wheelCoach = createWheelCoach()

export const useWheelCoach = (): CoachState =>
  useSyncExternalStore(wheelCoach.subscribe, wheelCoach.get, wheelCoach.get)
