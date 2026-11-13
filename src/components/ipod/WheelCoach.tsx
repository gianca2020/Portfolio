import { useEffect, useState, type RefObject } from 'react'
import { DEVICE_MM } from './constants'
import { useWheelCoach } from './state/wheelCoach'

/** Fade-out after the first scroll (skipped with reduced motion). */
const FADE_MS = 200
/** The glass window's corner radius as a share of its width, so the cut-out hugs it exactly. */
const GLASS_RADIUS = DEVICE_MM.window.radius / DEVICE_MM.window.width

interface Hole {
  x: number
  y: number
  width: number
  height: number
}

const holeOf = (el: Element | null): Hole | null => {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, width: r.width, height: r.height }
}

/**
 * Tracks where the LCD and the click wheel are on screen. The device scales
 * with the viewport (--u) and slides in on load, so it is measured, not computed.
 */
function useDeviceHoles(stage: RefObject<HTMLElement | null>, enabled: boolean) {
  const [holes, setHoles] = useState<{ screen: Hole; wheel: Hole } | null>(null)

  // A passive effect, not a layout one: this overlay renders inside the stage, and a
  // child's layout effects run before the parent's ref is attached.
  useEffect(() => {
    const root = stage.current
    if (!enabled || !root) return
    const screen = root.querySelector('.ipod__slot')
    const wheel = root.querySelector('.ipod-wheel')
    const measure = () => {
      const s = holeOf(screen)
      const w = holeOf(wheel)
      setHoles(s && w ? { screen: s, wheel: w } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (screen) observer.observe(screen)
    if (wheel) observer.observe(wheel)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    root.addEventListener('animationend', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      root.removeEventListener('animationend', measure)
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

const INSTRUCTION = 'Turn the click wheel, or press the up and down arrow keys, to scroll through the menu.'

/**
 * The page dim for the first-visit wheel hint: everything but the LCD and the
 * click wheel goes dark until the visitor scrolls. It never takes pointer
 * events, so the wheel underneath works as usual. The hint's text lives in
 * <WheelCoachCaption> and its animation in the click wheel.
 */
export function WheelCoachOverlay({
  stage,
  active,
  reducedMotion,
}: {
  stage: RefObject<HTMLElement | null>
  active: boolean
  reducedMotion: boolean
}) {
  const coach = useWheelCoach()
  const show = active && coach.active
  const mounted = usePresence(show, reducedMotion)
  const holes = useDeviceHoles(stage, mounted)

  return (
    <>
      {/* Spoken on start and again on every held press. */}
      <output className="sr-only">
        {show ? `${INSTRUCTION}${coach.nudges % 2 ? ' ' : ''}` : ''}
      </output>
      {mounted && holes && (
        <svg className="ipod-coach-dim" data-leaving={!show || undefined} aria-hidden="true" focusable="false">
          <defs>
            <mask id="ipod-coach-mask">
              <rect width="100%" height="100%" fill="white" />
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
          <rect width="100%" height="100%" mask="url(#ipod-coach-mask)" />
        </svg>
      )}
    </>
  )
}

/** Replaces the stage's hint line while the coach is up; sits above the dim. */
export function WheelCoachCaption({ nudges }: { nudges: number }) {
  return (
    <p className="ipod-hint ipod-hint--coach" key={nudges} aria-hidden="true">
      <span className="ipod-hint--coach__title">
        <span aria-hidden="true">↻</span> Turn the wheel to scroll
      </span>
      <span className="ipod-hint__fine">Drag around the ring · or press ↑ ↓</span>
      <span className="ipod-hint__coarse">Slide your thumb around the ring</span>
    </p>
  )
}
