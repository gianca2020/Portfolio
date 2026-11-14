import { useCallback, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react'
import './chassis.css'
import { DEVICE_MM } from './constants'
import { sliderKeyMove, sliderValue } from './rotary'
import type { ChassisTheme } from './state/settingsContext'
import { useDeviceActive } from './state/deviceContext'
import { CoachHand } from './CoachHand'
import { useWheelCoach, type CoachState } from './state/wheelCoach'
import type { MoveSource } from './types'
import type { WheelA11y } from './useIPodEngine'
import { useRotaryInput } from './useRotaryInput'
import { WheelLegends } from './WheelLegends'

export interface ClickWheelProps {
  theme: ChassisTheme
  /**
   * Moves the highlight: +1 per clockwise step (next row), -1 per counter-clockwise step ('wheel'), or the
   * focused slider's own keys, where PageUp / PageDown jump ('key').
   */
  onRotate: (steps: number, source: MoveSource) => void
  onMenu: () => void
  onSelect: () => void
  onPrevious: () => void
  onNext: () => void
  onPlayPause: () => void
  /** Names the ⏯ key by what it will do next: "Pause" while playing, else "Play". */
  playing: boolean
  a11y: WheelA11y
}

const mm = (n: number) => `calc(var(--u) * ${Math.round(n * 1000) / 1000})`

const RADIUS = DEVICE_MM.wheel.diameter / 2
const HUB = DEVICE_MM.centerButton.diameter

/** Key hit areas: 12 mm along the ring × 10.6 mm across it, centred on the ring 13 mm out toward each legend. */
const KEY = { along: 12, across: 10.6, offset: 13 }
/** The rotation "thumb" rides the middle of the ring (% of the wheel's width from its centre). */
const THUMB_ORBIT = ((RADIUS + HUB / 2) / 2 / DEVICE_MM.wheel.diameter) * 100

/** The coach's hand, as wide as a third of the wheel, with its fingertip pinned to the point it touches. */
const COACH_HAND = DEVICE_MM.wheel.diameter * 0.34
/** Where the hand taps MENU: the middle of the legend (% of the wheel's height). */
const COACH_MENU_Y = ((RADIUS - DEVICE_MM.labels.menu) / DEVICE_MM.wheel.diameter) * 100

/** The coach's sweep covers the ring from the centre button's edge to the rim (% of the wheel's radius). */
const COACH_STYLE = {
  '--coach-hub': `${(HUB / DEVICE_MM.wheel.diameter) * 100}%`,
  '--coach-hand': mm(COACH_HAND),
  '--coach-menu-y': `${COACH_MENU_Y}%`,
  '--coach-ripple': mm(HUB * 0.9),
} as CSSProperties

/* Reduced-motion coach: a still 270° arrow along the middle of the ring, 12 o'clock round to 9
 * o'clock, in a 100 × 100 box over the wheel. */
const COACH_MID = (HUB / DEVICE_MM.wheel.diameter) * 25 + 25
const COACH_ARC = `M 50 ${50 - COACH_MID} A ${COACH_MID} ${COACH_MID} 0 1 1 ${50 - COACH_MID} 50`
const COACH_ARROWHEAD = [
  [50 - COACH_MID, 50 - 9],
  [50 - COACH_MID - 7, 50 + 1],
  [50 - COACH_MID + 7, 50 + 1],
]
  .map((p) => p.join(','))
  .join(' ')

function keyStyle(dx: number, dy: number): CSSProperties {
  const width = dx === 0 ? KEY.along : KEY.across
  const height = dx === 0 ? KEY.across : KEY.along
  return {
    left: mm(RADIUS + dx * KEY.offset - width / 2),
    top: mm(RADIUS + dy * KEY.offset - height / 2),
    width: mm(width),
    height: mm(height),
  }
}

const MENU_KEY = keyStyle(0, -1)
const PREVIOUS_KEY = keyStyle(-1, 0)
const NEXT_KEY = keyStyle(1, 0)
const PLAY_KEY = keyStyle(0, 1)
const HUB_KEY: CSSProperties = {
  left: mm(RADIUS - HUB / 2),
  top: mm(RADIUS - HUB / 2),
  width: mm(HUB),
  height: mm(HUB),
}

interface WheelKeyProps {
  label: string
  style: CSSProperties
  onPress: () => void
  /** The centre Select button rather than a legend on the ring. */
  hub?: boolean
}

function WheelKey({ label, style, onPress, hub = false }: WheelKeyProps) {
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    // A mouse click can leave focus on the key (Chrome, Firefox), and the next Enter would then re-press
    // it instead of reaching the engine's global Select. Keyboard presses (detail 0) keep their focus.
    if (event.detail > 0) event.currentTarget.blur()
    onPress()
  }
  return (
    <button
      type="button"
      className={hub ? 'ipod-wheel__hub' : 'ipod-wheel__key'}
      style={style}
      aria-label={label}
      onClick={onClick}
    />
  )
}

/**
 * The first-visit tutorial drawn on the wheel (see state/wheelCoach.ts). Scroll: an
 * orange comet turns round the ring (a still arrow under reduced motion), drawn under
 * the legends. The hand that leads it, and that then taps the centre button twice and
 * glides up to tap MENU, is drawn over everything (see <WheelCoachHand>). The animated
 * parts are keyed so a held press replays them.
 */
function WheelCoachComet({ coach }: { coach: CoachState }) {
  if (coach.step !== 'scroll') return null
  return (
    <div key={coach.nudges} className="ipod-wheel__coach" style={COACH_STYLE} aria-hidden="true">
      <div className="ipod-wheel__coach-comet">
        <div className="ipod-wheel__coach-spin">
          <div className="ipod-wheel__coach-sweep" />
          <div className="ipod-wheel__coach-head" />
        </div>
        <svg className="ipod-wheel__coach-arrow" viewBox="0 0 100 100" focusable="false">
          <path d={COACH_ARC} />
          <polygon points={COACH_ARROWHEAD} />
        </svg>
      </div>
    </div>
  )
}

/** The tapping hand's target isn't keyed, so it glides from the centre button up to MENU. */
function WheelCoachHand({ coach }: { coach: CoachState }) {
  const replay = `${coach.step}-${coach.nudges}`
  return (
    <div className="ipod-wheel__coach" data-step={coach.step} style={COACH_STYLE} aria-hidden="true">
      {coach.step === 'scroll' ? (
        <div key={replay} className="ipod-wheel__coach-orbit">
          <div className="ipod-wheel__coach-rider">
            <CoachHand className="ipod-wheel__coach-hand" />
          </div>
        </div>
      ) : (
        <div className="ipod-wheel__coach-target">
          <div key={replay} className="ipod-wheel__coach-tap">
            <span className="ipod-wheel__coach-ripple" />
            {coach.step === 'select' && <span className="ipod-wheel__coach-ripple" data-second="" />}
            <CoachHand className="ipod-wheel__coach-hand" />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * The click wheel: a rotary ring (drag around it, or scroll over it) with MENU,
 * ⏮, ⏭ and ⏯ printed at the compass points, and the Select button in the middle.
 */
export function ClickWheel(props: ClickWheelProps) {
  const { theme, onRotate, onMenu, onSelect, onPrevious, onNext, onPlayPause, playing, a11y } = props
  const thumbRef = useRef<HTMLDivElement>(null)
  const coach = useWheelCoach()
  const coaching = useDeviceActive() && coach.step !== null

  // Positions the soft pressure shading under the finger without re-rendering.
  const onTurn = useCallback((angle: number | null) => {
    const thumb = thumbRef.current
    if (!thumb) return
    if (angle === null) {
      delete thumb.dataset.active
      return
    }
    const radians = (angle * Math.PI) / 180
    thumb.style.setProperty('--thumb-x', `${50 + Math.cos(radians) * THUMB_ORBIT}%`)
    thumb.style.setProperty('--thumb-y', `${50 + Math.sin(radians) * THUMB_ORBIT}%`)
    thumb.dataset.active = ''
  }, [])

  const wheelRef = useRotaryInput<HTMLDivElement>({
    onRotate: (step) => onRotate(step, 'wheel'),
    onTurn,
    ignore: '.ipod-wheel__hub',
  })
  const { max, now } = sliderValue(a11y.index, a11y.count)

  // The engine maps ← → to Back / Select everywhere. On the focused slider they (and PageUp / PageDown) change its
  // value instead, as screen-reader users expect; preventDefault is what makes the engine's window handler skip them.
  const onSliderKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const move = sliderKeyMove(event.key)
    if (move === undefined) return
    event.preventDefault()
    onRotate(move, 'key')
  }

  return (
    <div ref={wheelRef} className="ipod-wheel" data-finish={theme}>
      {/* Keyboard users reach the ring with Tab; ↑ ↓ are handled globally by the engine. */}
      <div
        className="ipod-wheel__surface"
        // Not <input type="range">: it would consume the arrow keys the engine handles globally.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="slider"
        tabIndex={0}
        // Vertical, so assistive-technology increment / decrement arrive as ↑ / ↓ (move the highlight), not → / ←.
        aria-orientation="vertical"
        aria-label={a11y.label}
        aria-valuemin={1}
        aria-valuemax={max}
        aria-valuenow={now}
        aria-valuetext={a11y.valueText}
        onKeyDown={onSliderKeyDown}
      />
      <div ref={thumbRef} className="ipod-wheel__thumb" aria-hidden="true" />
      {coaching && <WheelCoachComet coach={coach} />}
      <WheelLegends />
      {/* DOM (and Tab) order follows reading order: top, left, centre, right, bottom. */}
      <WheelKey label="Menu — go back" style={MENU_KEY} onPress={onMenu} />
      <WheelKey label="Previous item" style={PREVIOUS_KEY} onPress={onPrevious} />
      <WheelKey label="Select" style={HUB_KEY} onPress={onSelect} hub />
      <WheelKey label="Next item" style={NEXT_KEY} onPress={onNext} />
      <WheelKey label={playing ? 'Pause' : 'Play'} style={PLAY_KEY} onPress={onPlayPause} />
      {coaching && <WheelCoachHand coach={coach} />}
    </div>
  )
}
