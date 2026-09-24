import { AnimatePresence, domMin, LazyMotion, m, useIsPresent, type Variants } from 'framer-motion'
import { SLIDE_DURATION } from './constants'
import { useLcdReducedMotion } from './lcd/hooks'
import { SLIDE_EASE } from './lcd/motion'
import { renderScreen } from './screens'
import type { NavigableNode, ScreenApi } from './types'

export interface ScreenStackProps {
  node: NavigableNode
  index: number
  /** Nesting depth; part of the animation key so re-opening a node still slides. */
  depth: number
  /** 1 = forward (slide left), -1 = back (slide right). */
  direction: 1 | -1
  api: ScreenApi
}

/**
 * Horizontal push: going deeper, the current screen leaves to the left while
 * the new one arrives from the right; going back, the reverse. `custom` is the
 * direction — AnimatePresence hands the latest one to the exiting screen.
 */
const slide: Variants = {
  enter: (direction: 1 | -1) => ({ x: direction > 0 ? '100%' : '-100%' }),
  centre: { x: 0 },
  exit: (direction: 1 | -1) => ({ x: direction > 0 ? '-100%' : '100%' }),
}

interface SlotProps extends Omit<ScreenStackProps, 'depth'> {
  instant: boolean
}

/**
 * One screen in the stack. Exiting children keep their last props, so whether
 * this screen is the live one comes from presence, not from props. Each slot
 * clips like a whole 320×240 frame, so the split panel's shadow never falls on
 * the neighbouring screen mid-push.
 */
function ScreenSlot({ node, index, direction, api, instant }: SlotProps) {
  const present = useIsPresent()
  return (
    <m.div
      custom={direction}
      variants={slide}
      initial="enter"
      animate="centre"
      exit="exit"
      transition={{ duration: instant ? 0 : SLIDE_DURATION, ease: SLIDE_EASE }}
      aria-hidden={present ? undefined : true}
      className="absolute inset-0 overflow-hidden bg-lcd pt-[20px]"
      style={present ? undefined : { pointerEvents: 'none' }}
    >
      <div className="relative h-full">{renderScreen({ node, index, active: present, api })}</div>
    </m.div>
  )
}

/**
 * The animated screen area. Fills the whole 320×240 canvas (absolute inset-0,
 * clipped). Each screen slot reserves the 20px status bar at the top
 * (pt-[20px]) and renders the screen in a relative 320×220 box; only the split
 * menu's preview panel reaches up into that inset (top: -20px).
 *
 * Everything animated on the LCD (the push, Cover Flow's poses) is a plain
 * animate / exit transition, so `m` components with the minimal `domMin`
 * feature set are enough — no gesture, drag or layout code in the bundle.
 * `strict` makes a stray full `motion.*` component throw in development.
 */
export function ScreenStack({ node, index, depth, direction, api }: ScreenStackProps) {
  const instant = useLcdReducedMotion()
  return (
    <LazyMotion features={domMin} strict>
      <div className="absolute inset-0 isolate overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <ScreenSlot
            key={`${depth}:${node.id}`}
            node={node}
            index={index}
            direction={direction}
            api={api}
            instant={instant}
          />
        </AnimatePresence>
      </div>
    </LazyMotion>
  )
}
