import { DEGREES_PER_STEP, MENU_VISIBLE_ROWS } from './constants'

/*
 * Click-wheel maths and its slider keys: pure functions, no DOM, angles in degrees.
 *
 * Angles come from Math.atan2(dy, dx) in screen space, where y grows downward:
 * 0° is 3 o'clock and 90° is 6 o'clock, so an increasing angle is a clockwise
 * turn. Clockwise maps to +1 (next row), as on the real wheel.
 */

/** Net rotation (degrees) that turns a mouse or pen press into a drag. */
export const DRAG_SLOP_DEG = 4
/** Straight-line travel (px) that also turns a press into a drag. */
export const DRAG_SLOP_PX = 4
/** Fingers wobble more than a mouse: a tap may drift a little further. */
export const TOUCH_DRAG_SLOP_PX = 8
/**
 * The angle a finger may drift before its tap becomes a turn. The mouse's 4° is under 3 px of sideways drift at a
 * key's inner edge on a phone, well short of the px allowance. Half a detent keeps every slop below one step, so no
 * step is lost to it.
 */
export const TOUCH_DRAG_SLOP_DEG = DEGREES_PER_STEP / 2
/** Fraction of the wheel radius around the hub where the angle is too unstable to use. */
export const DEAD_ZONE = 0.2
/** Trackpad travel (px) per step. A single larger event (a mouse-wheel notch) is one step. */
export const SCROLL_PX_PER_STEP = 40
/** A pause (ms) after which a leftover scroll remainder is forgotten. */
export const SCROLL_IDLE_MS = 250

const LINE_PX = 16
const EPSILON = 1e-9

export interface Polar {
  /** Degrees in (−180, 180]; clockwise is positive. */
  angle: number
  /** Distance from the centre, in the same unit as the input. */
  distance: number
}

/** Pointer offset from the wheel centre → angle + distance. */
export function toPolar(dx: number, dy: number): Polar {
  return { angle: (Math.atan2(dy, dx) * 180) / Math.PI, distance: Math.hypot(dx, dy) }
}

/**
 * Wrap an angle difference into (−180, 180] — the short way round. Without it,
 * crossing the ±180° seam at 9 o'clock (179° → −179°) would read as a −358° spin
 * instead of the +2° the finger actually moved.
 */
export function normalizeDegrees(delta: number): number {
  const wrapped = ((delta % 360) + 360) % 360
  return wrapped > 180 ? wrapped - 360 : wrapped
}

/**
 * Split an accumulated amount into whole steps plus the remainder to carry.
 * Truncates toward zero so both directions behave the same (−40 → −2 steps, −4 left).
 */
export function quantize(amount: number, stepSize: number): { steps: number; remainder: number } {
  // The epsilon absorbs float error, e.g. 10.1 + 7.9 landing a hair under 18. `|| 0` turns −0 into 0.
  const steps = Math.trunc(amount / stepSize + Math.sign(amount) * EPSILON) || 0
  return { steps, remainder: amount - steps * stepSize }
}

export interface RotaryState {
  /** Angle of the previous sample; null before the first one or after passing through the dead zone. */
  anchor: number | null
  /** Rotation carried toward the next step (degrees, clockwise positive). */
  accumulated: number
  /** Net rotation since the press began (degrees): tells a tap from a turn. */
  turned: number
}

export const startRotary = (angle: number | null = null): RotaryState => ({ anchor: angle, accumulated: 0, turned: 0 })

/**
 * Feed one pointer sample. `angle` null means the pointer is in the dead zone:
 * the anchor is dropped and re-set by the next usable sample, so wandering
 * across the hub never produces a jump.
 */
export function advanceRotary(
  state: RotaryState,
  angle: number | null,
  stepDegrees: number = DEGREES_PER_STEP,
): { state: RotaryState; steps: number } {
  if (angle === null) return { state: { ...state, anchor: null }, steps: 0 }
  if (state.anchor === null) return { state: { ...state, anchor: angle }, steps: 0 }

  const delta = normalizeDegrees(angle - state.anchor)
  const { steps, remainder } = quantize(state.accumulated + delta, stepDegrees)
  return { state: { anchor: angle, accumulated: remainder, turned: state.turned + delta }, steps }
}

/** Has a press turned or travelled far enough to count as a rotation rather than a tap? */
export function isDrag(turned: number, moved: number, pointerType: string): boolean {
  const touch = pointerType === 'touch'
  const slopDeg = touch ? TOUCH_DRAG_SLOP_DEG : DRAG_SLOP_DEG
  const slopPx = touch ? TOUCH_DRAG_SLOP_PX : DRAG_SLOP_PX
  return Math.abs(turned) >= slopDeg || moved >= slopPx
}

/** WheelEvent delta → px, whatever its deltaMode (0 = px, 1 = lines, 2 = pages). */
export function wheelDeltaToPx(delta: number, deltaMode: number, pagePx: number): number {
  if (deltaMode === 1) return delta * LINE_PX
  if (deltaMode === 2) return delta * pagePx
  return delta
}

/**
 * Accumulate scroll travel into steps, at most one per event. Small trackpad deltas add up, while any single larger
 * event moves exactly one row, like a detent: a mouse-wheel notch (100 px in Chromium on Windows, 3 lines in
 * Firefox) or a page-mode tick. Reversing drops the old remainder so the new direction answers at once.
 */
export function advanceScroll(
  accumulated: number,
  deltaPx: number,
  pxPerStep: number = SCROLL_PX_PER_STEP,
): { steps: number; remainder: number } {
  const carried = accumulated * deltaPx < 0 ? 0 : accumulated
  const { steps, remainder } = quantize(carried + deltaPx, pxPerStep)
  return { steps: Math.sign(steps), remainder }
}

/* ── The wheel as an ARIA slider ─────────────────────────────────────────── */

/**
 * aria-valuemax / aria-valuenow for the wheel slider. It is vertical, so its maximum is at the top: the first row is
 * `max` and the last is 1. Browsers deliver a screen reader's "increment" on a vertical slider as ArrowUp, which
 * moves the highlight up, so increment raises the value as it should.
 */
export function sliderValue(index: number, count: number): { max: number; now: number } {
  const max = Math.max(1, count)
  return { max, now: max - Math.min(index, max - 1) }
}

/** Rows that PageUp / PageDown move on the focused wheel: one screenful. */
export const SLIDER_PAGE_ROWS = MENU_VISIBLE_ROWS

const SLIDER_KEYS = new Map([
  ['ArrowRight', -1],
  ['ArrowLeft', 1],
  ['PageUp', -SLIDER_PAGE_ROWS],
  ['PageDown', SLIDER_PAGE_ROWS],
])

/**
 * Keys the focused wheel slider handles itself, as a highlight move (+1 = next row, down the list); undefined for
 * any other key. As on any vertical slider, → and PageUp raise the value (up the list) and ← and PageDown lower it.
 * ↑ ↓ stay with the engine's global handler, which already moves the highlight, and Home stays "Main menu".
 */
export const sliderKeyMove = (key: string): number | undefined => SLIDER_KEYS.get(key)
