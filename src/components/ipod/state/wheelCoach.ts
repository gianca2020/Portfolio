import { useSyncExternalStore } from 'react'

/* ────────────────────────────────────────────────────────────────────────────
 * Wheel coach
 *
 * A brief first-visit tutorial: the page dims around the LCD and the click
 * wheel, and an animated dot traces the ring until the visitor scrolls once.
 * Until then other presses are held (they replay the hint instead). The first
 * scroll ends it for good in this browser, as do Skip / Esc / Menu, or a third
 * press (two held presses are enough of a hint). Settings › Wheel Tutorial
 * replays it.
 *
 * Lives outside React so the engine's input handlers and `runMenuAction` can
 * reach it without threading props.
 * ──────────────────────────────────────────────────────────────────────────── */

export interface CoachState {
  active: boolean
  /** Bumped on every held press, so the hint can restart its animation. */
  nudges: number
}

/** Presses held (replaying the hint) before the next one is let through. */
export const MAX_HELD_PRESSES = 2

export type CoachInput = 'move' | 'press' | 'back'

/**
 * What the engine does with an input while the coach may be showing:
 * - pass: no coach, act normally
 * - step: a scroll; it scrolls and ends the coach
 * - hold: swallow it and replay the hint
 * - skip: Back (Esc / Menu) dismisses the coach without going back
 * - release: the hint has been replayed enough; end the coach and act
 */
export type CoachVerdict = 'pass' | 'step' | 'hold' | 'skip' | 'release'

export function coachIntercepts(state: CoachState, input: CoachInput): CoachVerdict {
  if (!state.active) return 'pass'
  if (input === 'move') return 'step'
  if (input === 'back') return 'skip'
  return state.nudges < MAX_HELD_PRESSES ? 'hold' : 'release'
}

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
    /** The visitor scrolled or skipped: the hint has done its job. */
    end() {
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
