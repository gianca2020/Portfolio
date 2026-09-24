/**
 * The firmware's marquee for a highlighted row whose label doesn't fit: rest,
 * scroll left at a slow, steady pace until the end of the label shows, rest
 * again, snap back and repeat.
 */
export const MARQUEE_REST_MS = 1000
/** Scroll speed in LCD px per second. */
export const MARQUEE_SPEED = 30

/** Overflow below this (px) is measurement noise, not a clipped label. */
const MIN_SHIFT = 0.05

/**
 * How far (LCD px) a label has to move to show its end. The rendered widths
 * may be scaled by the LCD's CSS transform, so the overflow is taken as a
 * ratio and applied to the box's unscaled layout width.
 */
export function marqueeShift(textWidth: number, boxWidth: number, layoutWidth: number): number {
  if (!(boxWidth > 0) || !(textWidth > 0)) return 0
  const shift = (textWidth / boxWidth - 1) * layoutWidth
  return shift > MIN_SHIFT ? Math.ceil(shift) : 0
}

export interface MarqueeTimeline {
  keyframes: Keyframe[]
  /** One whole cycle (ms): rest, scroll, rest. */
  duration: number
}

/** One cycle for a label `shift` px too wide, to loop forever (the loop is the snap back). */
export function marqueeTimeline(shift: number): MarqueeTimeline {
  const travel = (shift / MARQUEE_SPEED) * 1000
  const duration = MARQUEE_REST_MS + travel + MARQUEE_REST_MS
  const start = 'translateX(0px)'
  const end = `translateX(${-shift}px)`
  return {
    duration,
    keyframes: [
      { offset: 0, transform: start },
      { offset: MARQUEE_REST_MS / duration, transform: start },
      { offset: (MARQUEE_REST_MS + travel) / duration, transform: end },
      { offset: 1, transform: end },
    ],
  }
}
