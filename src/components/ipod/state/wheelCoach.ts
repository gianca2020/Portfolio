import { useSyncExternalStore } from 'react'

/* ────────────────────────────────────────────────────────────────────────────
 * Wheel coach
 *
 * A brief first-visit tutorial in three steps, each waiting for the visitor to
 * do it: turn the wheel (a hand rides an orange comet round the ring), tap the
 * centre to open the highlighted item (the hand taps twice), then press MENU
 * to go back (the hand taps MENU). The page dims around the LCD and the click
 * wheel throughout. Presses the current step isn't asking for are held (they
 * replay the hint instead), and a third such press is let through and ends the
 * tutorial (two held presses are enough of a hint). Skip / Esc / Menu before
 * the last step skip it. Finishing or skipping ends it for good in this
 * browser; Settings › Wheel Tutorial replays it.
 *
 * Lives outside React so the engine's input handlers and `runMenuAction` can
 * reach it without threading props.
 * ──────────────────────────────────────────────────────────────────────────── */

export type CoachStep = 'scroll' | 'select' | 'back'

export const COACH_STEPS: readonly CoachStep[] = ['scroll', 'select', 'back']

export interface CoachState {
  /** The step on show, or null once the tutorial is done. */
  step: CoachStep | null
  /** Bumped on every held press, so the hint can restart its animation. Reset on each step. */
  nudges: number
}

/** Presses held (replaying the hint) before the next one is let through. */
export const MAX_HELD_PRESSES = 2

/** A scroll, a select (centre / Enter / picking a row), Back (Esc / Menu), or any other press. */
export type CoachInput = 'move' | 'select' | 'back' | 'press'

/**
 * What the engine does with an input while the coach may be showing:
 * - pass: act normally
 * - advance: the input the step asks for; act and move on to the next step
 * - hold: swallow it and replay the hint
 * - skip: Back (Esc / Menu) dismisses the coach without going back
 * - release: the hint has been replayed enough; end the coach and act
 */
export type CoachVerdict = 'pass' | 'advance' | 'hold' | 'skip' | 'release'

const ASKS: Record<CoachStep, CoachInput> = { scroll: 'move', select: 'select', back: 'back' }

export function coachIntercepts(state: CoachState, input: CoachInput): CoachVerdict {
  const { step } = state
  if (step === null) return 'pass'
  if (input === ASKS[step]) return 'advance'
  // Once past the first step, scrolling around (and drilling further in on the last) is fine.
  if (input === 'move') return 'pass'
  if (input === 'select' && step === 'back') return 'pass'
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

export function createWheelCoach(initial: CoachState = { step: hasCompleted() ? null : 'scroll', nudges: 0 }) {
  let state = initial
  const listeners = new Set<() => void>()
  const set = (next: CoachState) => {
    state = next
    listeners.forEach((listener) => listener())
  }

  const end = () => {
    if (state.step === null) return
    saveCompleted()
    set({ ...state, step: null })
  }

  return {
    get: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    /** Show the tutorial from the top (Settings › Wheel Tutorial). */
    start: () => set({ step: 'scroll', nudges: 0 }),
    /** The visitor did what the step asked: on to the next one, or done after the last. */
    advance() {
      if (state.step === null) return
      const next = COACH_STEPS[COACH_STEPS.indexOf(state.step) + 1]
      if (next) set({ step: next, nudges: 0 })
      else end()
    },
    /** The visitor skipped (or pressed through): the tutorial has done its job. */
    end,
    /** A held press while the hint is up: replay it instead of acting. */
    nudge() {
      if (state.step !== null) set({ ...state, nudges: state.nudges + 1 })
    },
  }
}

export const wheelCoach = createWheelCoach()

export const useWheelCoach = (): CoachState =>
  useSyncExternalStore(wheelCoach.subscribe, wheelCoach.get, wheelCoach.get)
