import { useEffect, useId, useState, type MouseEvent, type RefObject } from 'react'
import { DEVICE_MM } from './constants'
import { wheelCoach, type CoachState } from './state/wheelCoach'

/** Fade-out after the first scroll (skipped with reduced motion). */
const FADE_MS = 200
/** Corner radii as a share of the measured width, so the cut-outs hug the shapes exactly. */
const DEVICE_RADIUS = DEVICE_MM.cornerRadius / DEVICE_MM.width
const GLASS_RADIUS = DEVICE_MM.window.radius / DEVICE_MM.window.width

interface Hole {
  x: number
  y: number
  width: number
  height: number
}

interface Holes {
  device: Hole
  screen: Hole
  wheel: Hole
}

const holeOf = (el: Element | null): Hole | null => {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, width: r.width, height: r.height }
}

const sameHole = (a: Hole, b: Hole) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height

const sameHoles = (a: Holes | null, b: Holes | null) =>
  a === b || (!!a && !!b && sameHole(a.device, b.device) && sameHole(a.screen, b.screen) && sameHole(a.wheel, b.wheel))

/**
 * Tracks where the device, its LCD and its click wheel are on screen. The
 * device scales with the viewport (--u) and slides in on load, so it is
 * measured, not computed.
 */
function useDeviceHoles(stage: RefObject<HTMLElement | null>, enabled: boolean) {
  const [holes, setHoles] = useState<Holes | null>(null)

  // A passive effect, not a layout one: this overlay renders inside the stage, and a
  // child's layout effects run before the parent's ref is attached.
  useEffect(() => {
    const root = stage.current
    if (!enabled || !root) return
    const device = root.querySelector('.ipod')
    const screen = root.querySelector('.ipod__slot')
    const wheel = root.querySelector('.ipod-wheel')
    const measure = () => {
      const d = holeOf(device)
      const s = holeOf(screen)
      const w = holeOf(wheel)
      const next = d && s && w ? { device: d, screen: s, wheel: w } : null
      setHoles((prev) => (sameHoles(prev, next) ? prev : next))
    }
    // Only the device's own entrance animation moves it; ignore the coach's animations.
    const onAnimationEnd = (event: AnimationEvent) => {
      if ((event.target as Element).classList?.contains('ipod-stage__device')) measure()
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (device) observer.observe(device)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    root.addEventListener('animationend', onAnimationEnd)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
      root.removeEventListener('animationend', onAnimationEnd)
    }
  }, [stage, enabled])

  return holes
}

/** Keeps the overlay mounted through its fade-out. */
function usePresence(show: boolean, reducedMotion: boolean) {
  const [mounted, setMounted] = useState(show)
  // State derived from the previous render: mount at once when shown.
  if (show && !mounted) setMounted(true)
  useEffect(() => {
    if (show || !mounted) return
    const timer = window.setTimeout(() => setMounted(false), reducedMotion ? 0 : FADE_MS)
    return () => window.clearTimeout(timer)
  }, [show, mounted, reducedMotion])
  return mounted || show
}

const INSTRUCTION =
  'Wheel tutorial: focus the click wheel and press the up or down arrow key to scroll through the menu. Press Escape or the Skip button to skip.'

/**
 * The status message, cleared and then set a frame later each time the hint
 * starts or replays: screen readers announce a live region's change, not the
 * text it already had when it appeared, and skip a repeat of the same text.
 */
function useAnnouncement(show: boolean, nudges: number) {
  const [message, setMessage] = useState('')
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      setMessage('')
      if (show) second = requestAnimationFrame(() => setMessage(INSTRUCTION))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [show, nudges])
  return message
}

/**
 * The page dim for the first-visit wheel hint: heavy around the device and
 * light over its body, so the finish keeps its colour, with the LCD and the
 * click wheel left fully lit. It never takes pointer events, so the wheel
 * underneath works as usual. The hint's text lives in <WheelCoachCaption> and
 * its animation in the click wheel.
 */
export function WheelCoachOverlay({
  stage,
  coach,
  show,
  reducedMotion,
}: {
  stage: RefObject<HTMLElement | null>
  coach: CoachState
  show: boolean
  reducedMotion: boolean
}) {
  const mounted = usePresence(show, reducedMotion)
  const holes = useDeviceHoles(stage, mounted)
  const message = useAnnouncement(show, coach.nudges)
  const id = useId()
  const outer = `${id}-outer`
  const inner = `${id}-inner`

  return (
    <>
      <output className="sr-only">{message}</output>
      {mounted && holes && (
        <svg className="ipod-coach-dim" data-leaving={!show || undefined} aria-hidden="true" focusable="false">
          <defs>
            {/* Everything but the device. */}
            <mask id={outer}>
              <rect width="100%" height="100%" fill="white" />
              <rect {...holes.device} rx={holes.device.width * DEVICE_RADIUS} fill="black" />
            </mask>
            {/* The device body, minus the LCD and the wheel. */}
            <mask id={inner}>
              <rect {...holes.device} rx={holes.device.width * DEVICE_RADIUS} fill="white" />
              <rect {...holes.screen} rx={holes.screen.width * GLASS_RADIUS} fill="black" />
              <ellipse
                cx={holes.wheel.x + holes.wheel.width / 2}
                cy={holes.wheel.y + holes.wheel.height / 2}
                rx={holes.wheel.width / 2}
                ry={holes.wheel.height / 2}
                fill="black"
              />
            </mask>
          </defs>
          <rect className="ipod-coach-dim__outer" width="100%" height="100%" mask={`url(#${outer})`} />
          <rect className="ipod-coach-dim__inner" width="100%" height="100%" mask={`url(#${inner})`} />
        </svg>
      )}
    </>
  )
}

/**
 * Sits over the stage's hint line while the coach is up, above the dim and
 * out of the layout flow, so the device doesn't move when it comes or goes.
 */
export function WheelCoachCaption({ nudges }: { nudges: number }) {
  // The button disappears with the coach; land keyboard users on the wheel instead of <body>.
  const skip = (event: MouseEvent<HTMLButtonElement>) => {
    const stage = event.currentTarget.closest('.ipod-stage')
    wheelCoach.end()
    stage?.querySelector<HTMLElement>('[role="slider"]')?.focus({ preventScroll: true })
  }
  return (
    <div className="ipod-coach-caption" key={nudges} data-nudged={nudges > 0 || undefined}>
      <p className="ipod-coach-caption__title" aria-hidden="true">
        ↻ Turn the wheel to scroll
      </p>
      <p className="ipod-coach-caption__detail">
        <span aria-hidden="true">
          <span className="ipod-hint__fine">Drag around the ring · or press ↑ ↓</span>
          <span className="ipod-hint__coarse">Slide your thumb around the ring</span>
          {' · '}
        </span>
        <button type="button" className="ipod-coach-caption__skip" onClick={skip}>
          Skip<span className="sr-only"> wheel tutorial</span>
        </button>
      </p>
    </div>
  )
}
