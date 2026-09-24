import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { attachRotaryInput, type RotaryInputOptions } from '../useRotaryInput'

/*
 * The gesture controller against a hand-rolled fake element (the suite runs in
 * Node, without a DOM). The wheel is 200 × 200 px at the origin: centre (100, 100).
 */

class FakeNode {
  private readonly selectors: string[]
  constructor(...selectors: string[]) {
    this.selectors = selectors
  }
  closest(selector: string) {
    return this.selectors.includes(selector) ? this : null
  }
}

class FakeButton extends FakeNode {
  blurred = false
  blur() {
    this.blurred = true
  }
}

type Listener = (event: FakeEvent) => void

interface FakeEvent {
  type: string
  target: unknown
  cancelable: boolean
  defaultPrevented: boolean
  propagationStopped: boolean
  preventDefault: () => void
  stopPropagation: () => void
  [key: string]: unknown
}

class FakeWheel {
  listeners: { type: string; listener: Listener; options: unknown }[] = []
  dataset: Record<string, string> = {}
  captured: number | null = null
  readonly key = new FakeButton('.key')
  readonly hub = new FakeButton('.hub')

  addEventListener(type: string, listener: Listener, options?: unknown) {
    this.listeners.push({ type, listener, options })
  }
  removeEventListener(type: string, listener: Listener) {
    this.listeners = this.listeners.filter((entry) => entry.type !== type || entry.listener !== listener)
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 200, height: 200 }
  }
  setPointerCapture(pointerId: number) {
    this.captured = pointerId
  }
  contains(node: unknown) {
    return node === this.key || node === this.hub
  }

  fire(type: string, init: Record<string, unknown> = {}): FakeEvent {
    const event: FakeEvent = {
      type,
      target: this,
      cancelable: true,
      defaultPrevented: false,
      propagationStopped: false,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons: 1,
      detail: 1,
      timeStamp: 0,
      ...init,
      preventDefault() {
        event.defaultPrevented = true
      },
      stopPropagation() {
        event.propagationStopped = true
      },
    }
    for (const { type: registered, listener } of [...this.listeners]) if (registered === type) listener(event)
    return event
  }
}

/** A point on a circle of radius 60 px around the wheel centre; 0° = 3 o'clock, clockwise positive. */
function at(degrees: number, radius = 60) {
  const radians = (degrees * Math.PI) / 180
  return { clientX: 100 + Math.cos(radians) * radius, clientY: 100 + Math.sin(radians) * radius }
}

/** Drag from `from`° to `to`° in 3° samples (after the press at `from`). */
function drag(wheel: FakeWheel, from: number, to: number, init: Record<string, unknown> = {}) {
  const direction = Math.sign(to - from)
  for (let angle = from + 3 * direction; direction * (to - angle) >= 0; angle += 3 * direction) {
    wheel.fire('pointermove', { ...at(angle), ...init })
  }
}

let wheel: FakeWheel
let steps: number[]
let turns: (number | null)[]
let detach: () => void

beforeEach(() => {
  vi.stubGlobal('Element', FakeNode)
  vi.stubGlobal('HTMLButtonElement', FakeButton)
  vi.stubGlobal('document', { activeElement: null })
  vi.stubGlobal('window', { innerHeight: 800 })
  wheel = new FakeWheel()
  steps = []
  turns = []
  const options: RotaryInputOptions = {
    onRotate: (step) => steps.push(step),
    onTurn: (angle) => turns.push(angle),
    ignore: '.hub',
  }
  detach = attachRotaryInput(wheel as unknown as HTMLElement, () => options)
})

afterEach(() => {
  detach()
  vi.unstubAllGlobals()
})

describe('attachRotaryInput', () => {
  it('registers touchmove and wheel as non-passive and removes every listener on cleanup', () => {
    const options = (type: string) => wheel.listeners.find((entry) => entry.type === type)?.options
    expect(options('touchmove')).toEqual({ passive: false })
    expect(options('wheel')).toEqual({ passive: false })
    expect(options('click')).toBe(true) // capture phase, ahead of React's delegated onClick
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture']) {
      expect(wheel.listeners.some((entry) => entry.type === type)).toBe(true)
    }
    detach()
    expect(wheel.listeners).toEqual([])
  })

  it('turning clockwise emits +1 per 18°, one call per step', () => {
    wheel.fire('pointerdown', at(-90)) // 12 o'clock
    drag(wheel, -90, 0) // → 3 o'clock
    expect(steps).toEqual([1, 1, 1, 1, 1])
  })

  it('turning counter-clockwise emits −1 per 18°', () => {
    wheel.fire('pointerdown', at(0))
    drag(wheel, 0, -90)
    expect(steps).toEqual([-1, -1, -1, -1, -1])
  })

  it('a fast drag emits several steps from one event, and crossing 9 o’clock never jumps', () => {
    wheel.fire('pointerdown', at(170))
    wheel.fire('pointermove', at(175)) // start the turn
    wheel.fire('pointermove', at(-130)) // +55° through the ±180° seam
    expect(steps).toEqual([1, 1, 1])
  })

  it('a tap stays a tap: no capture, no steps, and its click reaches the key', () => {
    wheel.fire('pointerdown', { ...at(-90), target: wheel.key })
    wheel.fire('pointermove', at(-89)) // 1° / ~1 px wobble
    wheel.fire('pointerup', at(-89))
    const click = wheel.fire('click', { target: wheel.key })
    expect(wheel.captured).toBeNull()
    expect(steps).toEqual([])
    expect(click.defaultPrevented).toBe(false)
    expect(click.propagationStopped).toBe(false)
  })

  it('a finger drifting a few px sideways on a key still taps it', () => {
    const touch = { pointerType: 'touch', target: wheel.key }
    wheel.fire('pointerdown', { ...at(-90), ...touch })
    wheel.fire('pointermove', { ...at(-85), ...touch }) // 5° ≈ 5 px along the ring
    wheel.fire('pointerup', { ...at(-85), ...touch })
    const click = wheel.fire('click', { target: wheel.key })
    expect(wheel.captured).toBeNull()
    expect(click.defaultPrevented).toBe(false)
  })

  it('captures once past the slop and swallows the click that ends a rotation', () => {
    wheel.fire('pointerdown', { ...at(-90), target: wheel.key })
    wheel.fire('pointermove', at(-88))
    expect(wheel.captured).toBeNull()
    wheel.fire('pointermove', at(-85)) // 5° > 4° slop
    expect(wheel.captured).toBe(1)
    expect('rotating' in wheel.dataset).toBe(true)

    drag(wheel, -85, -40)
    wheel.fire('pointerup', at(-40))
    expect('rotating' in wheel.dataset).toBe(false)
    expect(turns.at(-1)).toBeNull()

    const click = wheel.fire('click', { target: wheel.key })
    expect(click.defaultPrevented).toBe(true)
    expect(click.propagationStopped).toBe(true)

    // Only that one click: the next press starts clean.
    wheel.fire('pointerdown', { ...at(-90), target: wheel.key })
    wheel.fire('pointerup', at(-90))
    expect(wheel.fire('click', { target: wheel.key }).defaultPrevented).toBe(false)
  })

  it('never swallows a keyboard activation (detail 0)', () => {
    wheel.fire('pointerdown', at(0))
    drag(wheel, 0, 30)
    wheel.fire('pointerup', at(30))
    expect(wheel.fire('click', { target: wheel.key, detail: 0 }).defaultPrevented).toBe(false)
  })

  it('blurs a wheel key focused by the press once it becomes a rotation', () => {
    vi.stubGlobal('document', { activeElement: wheel.key })
    wheel.fire('pointerdown', { ...at(-90), target: wheel.key })
    drag(wheel, -90, -80)
    expect(wheel.key.blurred).toBe(true)
  })

  it('a press on the centre button never rotates', () => {
    wheel.fire('pointerdown', { clientX: 100, clientY: 70, target: wheel.hub })
    wheel.fire('pointermove', at(0))
    wheel.fire('pointermove', at(60))
    expect(steps).toEqual([])
    expect(wheel.captured).toBeNull()
  })

  it('ignores presses in the square’s corners, outside the wheel', () => {
    wheel.fire('pointerdown', { clientX: 5, clientY: 5 })
    wheel.fire('pointermove', at(-90))
    wheel.fire('pointermove', at(0))
    expect(steps).toEqual([])
  })

  it('re-anchors after passing through the dead zone instead of jumping', () => {
    wheel.fire('pointerdown', at(0))
    drag(wheel, 0, 9) // rotating, nothing emitted yet
    wheel.fire('pointermove', { clientX: 101, clientY: 101 }) // inside 20% of the radius
    wheel.fire('pointermove', at(180)) // re-anchor on the far side: no 171° jump
    expect(steps).toEqual([])
    drag(wheel, 180, 198)
    expect(steps).toEqual([1])
  })

  it('pointercancel ends a turn', () => {
    wheel.fire('pointerdown', at(0))
    drag(wheel, 0, 30)
    wheel.fire('pointercancel')
    expect('rotating' in wheel.dataset).toBe(false)
    expect(turns.at(-1)).toBeNull()
    wheel.fire('pointermove', at(90))
    expect(steps).toEqual([1])
  })

  it('only the wheel losing capture ends a turn (a key’s implicit touch capture does not)', () => {
    wheel.fire('pointerdown', { ...at(-90), pointerType: 'touch', target: wheel.key })
    drag(wheel, -90, -80, { pointerType: 'touch' })
    wheel.fire('lostpointercapture', { target: wheel.key })
    expect('rotating' in wheel.dataset).toBe(true)
    wheel.fire('lostpointercapture')
    expect('rotating' in wheel.dataset).toBe(false)
  })

  it('a mouse move with no button held ends a press whose pointerup was missed', () => {
    wheel.fire('pointerdown', at(0))
    wheel.fire('pointermove', { ...at(60), buttons: 0 })
    wheel.fire('pointermove', at(90))
    expect(steps).toEqual([])
  })

  it('a new press mid-turn ends the old turn cleanly', () => {
    wheel.fire('pointerdown', { ...at(0), pointerType: 'touch' })
    drag(wheel, 0, 30, { pointerType: 'touch' })
    expect('rotating' in wheel.dataset).toBe(true)
    wheel.fire('pointerdown', { ...at(0), pointerId: 2 })
    expect('rotating' in wheel.dataset).toBe(false)
    expect(turns.at(-1)).toBeNull()
  })

  it('stops page panning only while a press is in progress', () => {
    expect(wheel.fire('touchmove').defaultPrevented).toBe(false)
    wheel.fire('pointerdown', { ...at(0), pointerType: 'touch' })
    expect(wheel.fire('touchmove').defaultPrevented).toBe(true)
    wheel.fire('pointerup', { pointerType: 'touch' })
    expect(wheel.fire('touchmove').defaultPrevented).toBe(false)
  })

  it('scroll over the wheel steps every 40 px (down = next) and never scrolls the page', () => {
    for (const [i, deltaY] of [10, 10, 10].entries()) {
      expect(wheel.fire('wheel', { deltaY, deltaMode: 0, timeStamp: 1000 + i * 10 }).defaultPrevented).toBe(true)
    }
    expect(steps).toEqual([])
    wheel.fire('wheel', { deltaY: 10, deltaMode: 0, timeStamp: 1030 }) // 40 px in total
    expect(steps).toEqual([1])
    wheel.fire('wheel', { deltaY: -3, deltaMode: 1, timeStamp: 1040 }) // 3 lines up = −48 px
    expect(steps).toEqual([1, -1])
  })

  it('a mouse-wheel notch moves exactly one row, however far apart the notches are', () => {
    for (const timeStamp of [1000, 1300, 1600, 1750, 1900, 2050]) {
      wheel.fire('wheel', { deltaY: 100, deltaMode: 0, timeStamp })
    }
    expect(steps).toEqual([1, 1, 1, 1, 1, 1])
    wheel.fire('wheel', { deltaY: 1, deltaMode: 2, timeStamp: 3000 }) // a whole page at once
    expect(steps).toHaveLength(7)
  })

  it('leaves pinch-zoom and sideways scrolling to the browser', () => {
    expect(wheel.fire('wheel', { deltaY: 50, deltaMode: 0, ctrlKey: true }).defaultPrevented).toBe(false)
    expect(wheel.fire('wheel', { deltaY: 0, deltaX: 50, deltaMode: 0 }).defaultPrevented).toBe(false)
    expect(steps).toEqual([])
  })
})
