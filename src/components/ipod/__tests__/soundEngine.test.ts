import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/* Each test imports a fresh module so the singleton starts locked. */
async function freshEngine() {
  vi.resetModules()
  return (await import('../SoundEngine')).soundEngine
}

class FakeParam {
  value = 0
  setValueAtTime(value: number) {
    this.value = value
  }
  linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {}
  setTargetAtTime(value: number) {
    this.value = value
  }
}

class FakeAudioNode {
  connect<T>(node: T): T {
    return node
  }
  disconnect() {}
}

class FakeGain extends FakeAudioNode {
  gain = new FakeParam()
}

class FakeFilter extends FakeAudioNode {
  type = ''
  frequency = new FakeParam()
  Q = new FakeParam()
}

class FakeScheduled extends FakeAudioNode {
  buffer: unknown = null
  frequency = new FakeParam()
  onended: (() => void) | null = null
  started: number[] = []
  start(when: number, offset = 0) {
    this.started.push(when, offset)
  }
  stop() {}
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = []
  state = 'suspended'
  currentTime = 0
  sampleRate = 48000
  destination = new FakeAudioNode()
  filters: FakeFilter[] = []
  sources: FakeScheduled[] = []
  resumes = 0

  constructor() {
    FakeAudioContext.instances.push(this)
  }
  resume() {
    this.resumes++
    this.state = 'running'
    return Promise.resolve()
  }
  createGain() {
    return new FakeGain()
  }
  createBiquadFilter() {
    const filter = new FakeFilter()
    this.filters.push(filter)
    return filter
  }
  createBufferSource() {
    const source = new FakeScheduled()
    this.sources.push(source)
    return source
  }
  createOscillator() {
    return new FakeScheduled()
  }
  createBuffer(_channels: number, length: number, sampleRate: number) {
    const data = new Float32Array(length)
    return { duration: length / sampleRate, getChannelData: () => data }
  }
}

let listeners: Map<string, () => void>
let activation: { hasBeenActive: boolean }
let now: number

beforeEach(() => {
  FakeAudioContext.instances = []
  listeners = new Map()
  activation = { hasBeenActive: true }
  now = 1000
  vi.stubGlobal('window', {
    addEventListener: (type: string, listener: () => void) => listeners.set(type, listener),
    removeEventListener: (type: string) => listeners.delete(type),
  })
  vi.stubGlobal('navigator', { userActivation: activation })
  vi.stubGlobal('AudioContext', FakeAudioContext)
  vi.spyOn(performance, 'now').mockImplementation(() => now)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('soundEngine', () => {
  it('is import-safe and silent without a window (Node)', async () => {
    vi.unstubAllGlobals()
    const engine = await freshEngine()
    expect(() => {
      engine.click()
      engine.press()
      engine.unlock()
      engine.click()
    }).not.toThrow()
  })

  it('creates no AudioContext at import or before unlock(); click() and press() are no-ops until then', async () => {
    const engine = await freshEngine()
    engine.click()
    engine.press()
    expect(FakeAudioContext.instances).toHaveLength(0)
  })

  it('unlock() creates one context lazily, resumes it, and is safe to call repeatedly', async () => {
    const engine = await freshEngine()
    engine.unlock()
    engine.unlock()
    expect(FakeAudioContext.instances).toHaveLength(1)
    expect(FakeAudioContext.instances[0].state).toBe('running')
    expect(FakeAudioContext.instances[0].resumes).toBe(1)
  })

  it('falls back to webkitAudioContext', async () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', FakeAudioContext)
    const engine = await freshEngine()
    engine.unlock()
    expect(FakeAudioContext.instances).toHaveLength(1)
  })

  it('never throws when Web Audio is missing or blocked', async () => {
    vi.stubGlobal('AudioContext', undefined)
    let engine = await freshEngine()
    expect(() => [engine.unlock(), engine.click(), engine.press()]).not.toThrow()

    vi.stubGlobal('AudioContext', function Blocked() {
      throw new Error('NotAllowedError')
    })
    engine = await freshEngine()
    expect(() => [engine.unlock(), engine.click(), engine.setMuted(true)]).not.toThrow()
  })

  it('waits for real user activation (a touch pointerdown has none yet) and retries on the next gesture', async () => {
    activation.hasBeenActive = false
    const engine = await freshEngine()
    engine.unlock()
    expect(FakeAudioContext.instances).toHaveLength(0)
    expect(listeners.has('pointerup')).toBe(true)

    activation.hasBeenActive = true
    listeners.get('pointerup')?.()
    expect(FakeAudioContext.instances).toHaveLength(1)
    expect(listeners.size).toBe(0)
  })

  it('click() is a band-passed noise tick around 2.5–4 kHz with a little random variation', async () => {
    const engine = await freshEngine()
    engine.unlock()
    const ctx = FakeAudioContext.instances[0]
    const bands = new Set<number>()
    for (let i = 0; i < 20; i++) {
      now += 20
      engine.click()
    }
    for (const filter of ctx.filters) {
      expect(filter.type).toBe('bandpass')
      expect(filter.frequency.value).toBeGreaterThanOrEqual(2500)
      expect(filter.frequency.value).toBeLessThanOrEqual(4000)
      bands.add(filter.frequency.value)
    }
    expect(ctx.filters).toHaveLength(20)
    expect(bands.size).toBeGreaterThan(1)
  })

  it('press() sits lower than click()', async () => {
    const engine = await freshEngine()
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // no jitter
    engine.unlock()
    engine.click()
    now += 20
    engine.press()
    const [click, press] = FakeAudioContext.instances[0].filters
    expect(press.frequency.value).toBeLessThan(click.frequency.value)
  })

  it('drops calls closer than ~12 ms apart so a fast spin never buzzes', async () => {
    const engine = await freshEngine()
    engine.unlock()
    const ctx = FakeAudioContext.instances[0]
    engine.click()
    now += 5
    engine.click()
    now += 5
    engine.press()
    expect(ctx.sources).toHaveLength(1)
    now += 15
    engine.click()
    expect(ctx.sources).toHaveLength(2)
  })

  it('setMuted(true) stops scheduling; unmuting brings it back', async () => {
    const engine = await freshEngine()
    engine.unlock()
    const ctx = FakeAudioContext.instances[0]
    engine.setMuted(true)
    expect(engine.muted).toBe(true)
    engine.click()
    now += 20
    engine.press()
    expect(ctx.sources).toHaveLength(0)

    engine.setMuted(false)
    expect(engine.muted).toBe(false)
    now += 20
    engine.click()
    expect(ctx.sources).toHaveLength(1)
  })

  it('stays silent while the context is suspended', async () => {
    const engine = await freshEngine()
    engine.unlock()
    const ctx = FakeAudioContext.instances[0]
    ctx.state = 'suspended'
    engine.click()
    expect(ctx.sources).toHaveLength(0)
  })
})
