import { describe, expect, it } from 'vitest'
import { DEGREES_PER_STEP } from '../constants'
import {
  SLIDER_PAGE_ROWS,
  TOUCH_DRAG_SLOP_DEG,
  advanceRotary,
  advanceScroll,
  isDrag,
  normalizeDegrees,
  quantize,
  sliderKeyMove,
  sliderValue,
  startRotary,
  toPolar,
  wheelDeltaToPx,
  type RotaryState,
} from '../rotary'

/** Feed a sequence of angles from a fresh anchor; returns every step emitted and the final state. */
function turn(angles: (number | null)[]): { steps: number[]; state: RotaryState } {
  const [first, ...rest] = angles
  let state = startRotary(first)
  const steps: number[] = []
  for (const angle of rest) {
    const result = advanceRotary(state, angle)
    state = result.state
    if (result.steps) steps.push(result.steps)
  }
  return { steps, state }
}

describe('toPolar', () => {
  it('uses screen coordinates: increasing angle is clockwise', () => {
    expect(toPolar(1, 0).angle).toBe(0) // 3 o'clock
    expect(toPolar(0, 1).angle).toBe(90) // 6 o'clock (y grows downward)
    expect(toPolar(-1, 0).angle).toBe(180) // 9 o'clock
    expect(toPolar(0, -1).angle).toBe(-90) // 12 o'clock
    expect(toPolar(3, 4).distance).toBe(5)
  })
})

describe('normalizeDegrees', () => {
  it('wraps any difference into (−180, 180]', () => {
    expect(normalizeDegrees(0)).toBe(0)
    expect(normalizeDegrees(17)).toBe(17)
    expect(normalizeDegrees(-17)).toBe(-17)
    expect(normalizeDegrees(180)).toBe(180)
    expect(normalizeDegrees(-180)).toBe(180)
    expect(normalizeDegrees(190)).toBe(-170)
    expect(normalizeDegrees(-190)).toBe(170)
    expect(normalizeDegrees(540)).toBe(180)
    expect(normalizeDegrees(720)).toBe(0)
  })

  it('takes the short way across the ±180° seam', () => {
    expect(normalizeDegrees(-179 - 179)).toBe(2) // 179° → −179° is +2°, not −358°
    expect(normalizeDegrees(179 - -179)).toBe(-2) // −179° → 179° is −2°
  })
})

describe('quantize', () => {
  it('truncates toward zero symmetrically and keeps the remainder', () => {
    expect(quantize(40, 18)).toEqual({ steps: 2, remainder: 4 })
    expect(quantize(-40, 18)).toEqual({ steps: -2, remainder: -4 })
    expect(quantize(17.9, 18).steps).toBe(0)
  })

  it('absorbs float error right at a step boundary', () => {
    expect(quantize(10.1 + 7.9, 18).steps).toBe(1)
  })
})

describe('advanceRotary', () => {
  it(`emits +1 per ${DEGREES_PER_STEP}° clockwise`, () => {
    const { steps, state } = turn([0, 10, 20])
    expect(steps).toEqual([1])
    expect(state.accumulated).toBeCloseTo(2)
  })

  it(`emits −1 per ${DEGREES_PER_STEP}° counter-clockwise`, () => {
    const { steps, state } = turn([0, -10, -20])
    expect(steps).toEqual([-1])
    expect(state.accumulated).toBeCloseTo(-2)
  })

  it('carries the remainder between samples', () => {
    const { steps, state } = turn([0, 12, 24, 36, 48])
    // 12 → 24: 24° = 1 step + 6° · 24 → 36: 18° = 1 step + 0° · 36 → 48: 12° pending
    expect(steps).toEqual([1, 1])
    expect(state.accumulated).toBeCloseTo(12)
  })

  it('emits several steps from one fast sample', () => {
    const { steps, state } = turn([0, 100])
    expect(steps).toEqual([5])
    expect(state.accumulated).toBeCloseTo(10)
  })

  it('handles a fast drag across the seam', () => {
    const { steps } = turn([170, -130]) // +60° through 9 o'clock
    expect(steps).toEqual([3])
  })

  it('reads 179° → −179° as +2°', () => {
    const { steps, state } = turn([179, -179])
    expect(steps).toEqual([])
    expect(state.accumulated).toBeCloseTo(2)
    expect(state.turned).toBeCloseTo(2)
  })

  it('keeps counting smoothly around a full turn', () => {
    const angles = Array.from({ length: 37 }, (_, i) => normalizeDegrees(i * 10)) // 0° … 360° in 10° samples
    const { steps } = turn(angles)
    expect(steps.reduce((a, b) => a + b, 0)).toBe(360 / DEGREES_PER_STEP)
  })

  it('emits nothing below the step threshold', () => {
    const { steps, state } = turn([0, 5, 10, 15, 17.9])
    expect(steps).toEqual([])
    expect(state.accumulated).toBeCloseTo(17.9)
  })

  it('lets a reversal eat into the pending remainder instead of stepping back', () => {
    const { steps } = turn([0, 15, 5])
    expect(steps).toEqual([])
  })

  it('re-anchors after the dead zone instead of jumping', () => {
    const { steps, state } = turn([0, null, 90, 108])
    expect(steps).toEqual([1]) // only the 90° → 108° turn counts
    expect(state.turned).toBeCloseTo(18)
  })

  it('tracks net rotation for tap detection', () => {
    expect(turn([0, 3, -2]).state.turned).toBeCloseTo(-2)
  })
})

describe('isDrag', () => {
  it('turns a press into a drag after ~4° or ~4 px', () => {
    expect(isDrag(3.9, 0, 'mouse')).toBe(false)
    expect(isDrag(-4, 0, 'mouse')).toBe(true)
    expect(isDrag(0, 4, 'mouse')).toBe(true)
    expect(isDrag(0, 3, 'pen')).toBe(false)
  })

  it('is more forgiving of finger wobble, in px and in degrees', () => {
    expect(isDrag(0, 6, 'touch')).toBe(false)
    expect(isDrag(0, 8, 'touch')).toBe(true)
    // 5 px of sideways drift at a key's centre on a phone is ≈4°: still a tap.
    expect(isDrag(4.2, 5, 'touch')).toBe(false)
    expect(isDrag(-8.9, 0, 'touch')).toBe(false)
    expect(isDrag(9, 0, 'touch')).toBe(true)
  })

  it('makes every press a drag before its first step can register', () => {
    // Until the first step, accumulated === turned, so a step needs |turned| ≥ one detent.
    expect(TOUCH_DRAG_SLOP_DEG).toBeLessThan(DEGREES_PER_STEP)
    expect(isDrag(DEGREES_PER_STEP, 0, 'touch')).toBe(true)
  })
})

describe('scroll input', () => {
  it('normalises deltaMode to px', () => {
    expect(wheelDeltaToPx(30, 0, 800)).toBe(30)
    expect(wheelDeltaToPx(3, 1, 800)).toBe(48)
    expect(wheelDeltaToPx(-1, 2, 800)).toBe(-800)
  })

  it('steps every 40 px and carries the rest', () => {
    let result = advanceScroll(0, 30)
    expect(result).toEqual({ steps: 0, remainder: 30 })
    result = advanceScroll(result.remainder, 30)
    expect(result).toEqual({ steps: 1, remainder: 20 })
    expect(advanceScroll(0, -45)).toEqual({ steps: -1, remainder: -5 })
  })

  it('moves at most one row per event, like a detent', () => {
    expect(advanceScroll(0, 100)).toEqual({ steps: 1, remainder: 20 }) // a Chromium-on-Windows notch
    expect(advanceScroll(20, 100)).toEqual({ steps: 1, remainder: 0 }) // the next one, carry and all
    expect(advanceScroll(0, wheelDeltaToPx(-1, 2, 800))).toEqual({ steps: -1, remainder: 0 }) // a page tick
  })

  it('drops the remainder when the direction reverses', () => {
    expect(advanceScroll(35, -10)).toEqual({ steps: 0, remainder: -10 })
  })
})

describe('wheel slider', () => {
  it('is vertical with its maximum at the top: the first row is max, the last is 1', () => {
    expect(sliderValue(0, 7)).toEqual({ max: 7, now: 7 })
    expect(sliderValue(6, 7)).toEqual({ max: 7, now: 1 })
    expect(sliderValue(9, 7).now).toBe(1) // an unclamped index before a screen registers
    expect(sliderValue(0, 0)).toEqual({ max: 1, now: 1 })
  })

  it('handles → ← PageUp PageDown as highlight moves: → and PageUp raise the value, up the list', () => {
    expect(sliderKeyMove('ArrowRight')).toBe(-1)
    expect(sliderKeyMove('ArrowLeft')).toBe(1)
    expect(sliderKeyMove('PageUp')).toBe(-SLIDER_PAGE_ROWS)
    expect(sliderKeyMove('PageDown')).toBe(SLIDER_PAGE_ROWS)
  })

  it('leaves every other key to the engine', () => {
    for (const key of ['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' ', 'Escape', 'a', 'constructor']) {
      expect(sliderKeyMove(key)).toBeUndefined()
    }
  })
})
