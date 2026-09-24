import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import {
  DEAD_ZONE,
  SCROLL_IDLE_MS,
  advanceRotary,
  advanceScroll,
  isDrag,
  startRotary,
  toPolar,
  wheelDeltaToPx,
  type RotaryState,
} from './rotary'

export interface RotaryInputOptions {
  /** Called once per detent: +1 clockwise (next), −1 counter-clockwise (previous). */
  onRotate: (step: number) => void
  /** Pointer angle (degrees, clockwise from 3 o'clock) while a rotation is in progress; null when it ends. */
  onTurn?: (angle: number | null) => void
  /** Presses that start inside an element matching this selector never rotate (the centre button). */
  ignore?: string
}

interface Gesture {
  pointerId: number
  pointerType: string
  /** Wheel bounds, cached for the gesture: the device doesn't move while you turn it. */
  rect: DOMRect
  startX: number
  startY: number
  rotary: RotaryState
  rotating: boolean
}

/**
 * Binds rotary input to a circular element and returns the cleanup. Drags
 * around it (mouse, pen, touch) and scroll-wheel / trackpad input over it
 * become click-wheel steps, emitted synchronously.
 *
 * A press stays a potential tap until it turns a few degrees (more for a
 * finger) or travels a few px; only then is the pointer captured and the press
 * treated as a rotation, whose trailing click is swallowed so it can't also
 * press the key under the finger. The element carries `data-rotating` while a
 * rotation is in progress.
 *
 * Keyboard input is not handled here: the engine owns it globally, and the
 * wheel's slider adds its own ← → PageUp PageDown.
 */
export function attachRotaryInput(el: HTMLElement, getOptions: () => RotaryInputOptions): () => void {
  let gesture: Gesture | null = null
  let swallowClick = false
  let scrolled = 0
  let scrolledAt = -Infinity

  const emit = (steps: number) => {
    const step = Math.sign(steps)
    for (let i = Math.abs(steps); i > 0; i--) getOptions().onRotate(step)
  }

  const polar = (rect: DOMRect, x: number, y: number) =>
    toPolar(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2))

  const beginRotation = (g: Gesture) => {
    g.rotating = true
    swallowClick = true
    el.dataset.rotating = ''
    try {
      el.setPointerCapture(g.pointerId)
    } catch {
      // The pointer is already gone; the gesture ends with its pointerup/cancel.
    }
    // A key focused by this press would otherwise take the next Enter meant for Select.
    const focused = document.activeElement
    if (focused instanceof HTMLButtonElement && el.contains(focused)) focused.blur()
  }

  const finish = () => {
    const g = gesture
    gesture = null
    if (!g?.rotating) return
    delete el.dataset.rotating
    getOptions().onTurn?.(null)
  }

  const track = (g: Gesture, x: number, y: number) => {
    const { angle, distance } = polar(g.rect, x, y)
    const usable = distance >= (g.rect.width / 2) * DEAD_ZONE ? angle : null
    const { state, steps } = advanceRotary(g.rotary, usable)
    g.rotary = state
    if (!g.rotating) {
      // Below the slop `steps` is always 0: a step needs 18° of turn, more than any slop.
      if (!isDrag(state.turned, Math.hypot(x - g.startX, y - g.startY), g.pointerType)) return
      beginRotation(g)
    }
    if (usable !== null) getOptions().onTurn?.(usable)
    if (steps) emit(steps)
  }

  const onPointerDown = (event: PointerEvent) => {
    swallowClick = false
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
    const { ignore } = getOptions()
    if (ignore && event.target instanceof Element && event.target.closest(ignore)) return

    const rect = el.getBoundingClientRect()
    const radius = rect.width / 2
    const { angle, distance } = polar(rect, event.clientX, event.clientY)
    if (distance > radius) return // the square's corners are chassis, not wheel

    // Another pointer type took over mid-turn (mouse after touch): end the old turn cleanly.
    finish()
    gesture = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      rotary: startRotary(distance >= radius * DEAD_ZONE ? angle : null),
      rotating: false,
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    const g = gesture
    if (!g || event.pointerId !== g.pointerId) return
    // A mouse released outside the wheel before the drag was captured: we never saw its pointerup.
    if (event.pointerType === 'mouse' && event.buttons === 0) return finish()
    // Fast spins arrive coalesced; replaying every sample keeps the angle deltas small and exact.
    const coalesced = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : []
    for (const sample of coalesced.length > 0 ? coalesced : [event]) track(g, sample.clientX, sample.clientY)
  }

  const onPointerEnd = (event: PointerEvent) => {
    if (gesture && event.pointerId === gesture.pointerId) finish()
  }

  // Only the wheel losing capture ends a turn. Touch pointers start implicitly captured by the key
  // under the finger, and moving capture to the wheel fires a (bubbling) lostpointercapture there.
  const onLostCapture = (event: PointerEvent) => {
    if (event.target === el) onPointerEnd(event)
  }

  const onClickCapture = (event: MouseEvent) => {
    // detail 0 = keyboard activation (Enter / Space on a focused key): never swallowed.
    if (!swallowClick || event.detail === 0) return
    swallowClick = false
    event.preventDefault()
    event.stopPropagation()
  }

  // iOS Safari can still pan the page from a touch that started on the wheel.
  const onTouchMove = (event: TouchEvent) => {
    if (gesture && event.cancelable) event.preventDefault()
  }

  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.deltaY === 0) return // pinch-zoom / sideways scroll stay with the browser
    event.preventDefault()
    if (event.timeStamp - scrolledAt > SCROLL_IDLE_MS) scrolled = 0
    scrolledAt = event.timeStamp
    const deltaPx = wheelDeltaToPx(event.deltaY, event.deltaMode, window.innerHeight)
    const { steps, remainder } = advanceScroll(scrolled, deltaPx)
    scrolled = remainder
    if (steps) emit(steps)
  }

  const active = { passive: false } as const
  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', onPointerEnd)
  el.addEventListener('pointercancel', onPointerEnd)
  el.addEventListener('lostpointercapture', onLostCapture)
  el.addEventListener('click', onClickCapture, true)
  el.addEventListener('touchmove', onTouchMove, active)
  el.addEventListener('wheel', onWheel, active)
  return () => {
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerup', onPointerEnd)
    el.removeEventListener('pointercancel', onPointerEnd)
    el.removeEventListener('lostpointercapture', onLostCapture)
    el.removeEventListener('click', onClickCapture, true)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('wheel', onWheel)
    finish()
  }
}

/** React binding for `attachRotaryInput`: attach the returned ref to the wheel element. */
export function useRotaryInput<T extends HTMLElement>(options: RotaryInputOptions): RefObject<T> {
  const ref = useRef<T>(null)
  const latest = useRef(options)
  useLayoutEffect(() => {
    latest.current = options
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return attachRotaryInput(el, () => latest.current)
  }, [])

  return ref
}
