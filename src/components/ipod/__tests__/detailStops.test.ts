import { describe, expect, it } from 'vitest'
import {
  actionAt,
  computeStops,
  DETAIL_STEP,
  indexForScrollTop,
  indexOfAction,
  revealTop,
  scrollTopFor,
  syncIndexForScroll,
} from '../detail/stops'

const stopTops = (maxScroll: number) => {
  const stops = computeStops(maxScroll, 0)
  return Array.from({ length: stops.scrollSteps + 1 }, (_, i) => scrollTopFor(stops, i))
}

describe('computeStops', () => {
  it('has one position per 48px step plus the top, plus one per action', () => {
    const stops = computeStops(100, 2)
    expect(stops.scrollSteps).toBe(2) // 0, 48, 100
    expect(stops.count).toBe(2 + 1 + 2)
  })

  it('has a single scroll position when nothing overflows', () => {
    expect(computeStops(0, 3)).toMatchObject({ scrollSteps: 0, count: 4 })
    expect(computeStops(-20, 0)).toMatchObject({ maxScroll: 0, scrollSteps: 0, count: 1 })
  })

  it('does not add a stop when maxScroll is an exact multiple of the step', () => {
    expect(computeStops(DETAIL_STEP * 2, 0).scrollSteps).toBe(2)
  })

  it('folds a remainder shorter than half a step into the last step', () => {
    expect(stopTops(97)).toEqual([0, 48, 97])
    expect(stopTops(145)).toEqual([0, 48, 96, 145])
    expect(stopTops(119)).toEqual([0, 48, 119])
    expect(stopTops(120)).toEqual([0, 48, 96, 120])
  })

  it('still reaches the bottom of a screen that barely overflows', () => {
    expect(stopTops(20)).toEqual([0, 20])
  })

  it('moves between half a step and one and a half steps per detent', () => {
    for (let max = DETAIL_STEP / 2; max <= 600; max++) {
      const tops = stopTops(max)
      expect(tops.at(-1)).toBe(max)
      for (let i = 1; i < tops.length; i++) {
        const moved = tops[i] - tops[i - 1]
        expect(moved).toBeGreaterThanOrEqual(DETAIL_STEP / 2)
        expect(moved).toBeLessThan(DETAIL_STEP * 1.5)
      }
    }
  })
})

describe('positions', () => {
  const stops = computeStops(100, 2)

  it('maps scroll stops to scrollTop, the last one resting at maxScroll', () => {
    expect([0, 1, 2].map((i) => scrollTopFor(stops, i))).toEqual([0, 48, 100])
    expect(scrollTopFor(stops, 4)).toBe(100)
  })

  it('highlights action rows only after the last scroll stop', () => {
    expect(actionAt(stops, 2)).toBe(-1)
    expect(actionAt(stops, 3)).toBe(0)
    expect(actionAt(stops, 4)).toBe(1)
    expect(actionAt(stops, 5)).toBe(-1)
    expect(indexOfAction(stops, 1)).toBe(4)
  })
})

describe('revealTop', () => {
  it('leaves a fully visible row alone', () => {
    expect(revealTop(100, 220, 150, 25)).toBe(100)
  })
  it('scrolls up to a row above the viewport', () => {
    expect(revealTop(100, 220, 80, 25)).toBe(80)
  })
  it('scrolls down just enough to show a row below the viewport', () => {
    expect(revealTop(0, 220, 250, 25)).toBe(55)
  })
  it('shows the top of a row taller than the viewport', () => {
    expect(revealTop(0, 100, 150, 300)).toBe(150)
  })
})

describe('native scroll sync', () => {
  const stops = computeStops(100, 2)

  it('picks the nearest stop and treats the bottom as the last stop', () => {
    expect(indexForScrollTop(stops, 0)).toBe(0)
    expect(indexForScrollTop(stops, 30)).toBe(1)
    // The last step is 52px (48 → 100): its midpoint is 74, not 72.
    expect(indexForScrollTop(stops, 73)).toBe(1)
    expect(indexForScrollTop(stops, 75)).toBe(2)
    expect(indexForScrollTop(stops, 97)).toBe(2)
    expect(indexForScrollTop(stops, 100)).toBe(2)
    expect(indexForScrollTop(computeStops(0, 1), 0)).toBe(0)
  })

  it('returns null when the index would not change', () => {
    expect(syncIndexForScroll(stops, 1, 50)).toBeNull()
  })

  it('keeps a highlighted action while the view rests at the bottom', () => {
    expect(syncIndexForScroll(stops, 3, 100)).toBeNull()
  })

  it('drops the action highlight once the user scrolls up', () => {
    expect(syncIndexForScroll(stops, 4, 40)).toBe(1)
  })
})
