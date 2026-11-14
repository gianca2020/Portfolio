import { afterEach, describe, expect, it, vi } from 'vitest'
import { menuTree } from '../data'
import { coachIntercepts, createWheelCoach, MAX_HELD_PRESSES, wheelCoach } from '../state/wheelCoach'
import { runMenuAction } from '../useIPodEngine'

const storage = (initial: Record<string, string> = {}) => {
  const data = { ...initial }
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('wheel coach', () => {
  it('shows on a first visit and not once completed', () => {
    vi.stubGlobal('window', { localStorage: storage() })
    expect(createWheelCoach().get().step).toBe('scroll')
    vi.stubGlobal('window', { localStorage: storage({ 'gf-ipod-portfolio:wheel-coach': 'done' }) })
    expect(createWheelCoach().get().step).toBe(null)
  })

  it('ends and remembers it', () => {
    const localStorage = storage()
    vi.stubGlobal('window', { localStorage })
    const coach = createWheelCoach()
    const seen: boolean[] = []
    coach.subscribe(() => seen.push(coach.get().step !== null))
    coach.end()
    expect(coach.get().step).toBe(null)
    expect(seen).toEqual([false])
    expect(localStorage.data['gf-ipod-portfolio:wheel-coach']).toBe('done')
  })

  it('counts held presses only while showing, and restarts from Settings', () => {
    vi.stubGlobal('window', { localStorage: storage() })
    const coach = createWheelCoach()
    coach.nudge()
    coach.nudge()
    expect(coach.get().nudges).toBe(2)
    coach.end()
    coach.nudge()
    expect(coach.get()).toEqual({ step: null, nudges: 2 })
    coach.start()
    expect(coach.get()).toEqual({ step: 'scroll', nudges: 0 })
  })

  it('tolerates blocked storage', () => {
    const throws = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('window', { localStorage: { getItem: throws, setItem: throws } })
    const coach = createWheelCoach()
    expect(coach.get().step).toBe('scroll')
    expect(() => coach.end()).not.toThrow()
    expect(coach.get().step).toBe(null)
  })

  it('walks scroll → select → back, then remembers it', () => {
    const localStorage = storage()
    vi.stubGlobal('window', { localStorage })
    const coach = createWheelCoach()
    coach.nudge()
    coach.advance()
    expect(coach.get()).toEqual({ step: 'select', nudges: 0 })
    coach.advance()
    expect(coach.get()).toEqual({ step: 'back', nudges: 0 })
    expect(localStorage.data['gf-ipod-portfolio:wheel-coach']).toBeUndefined()
    coach.advance()
    expect(coach.get().step).toBe(null)
    expect(localStorage.data['gf-ipod-portfolio:wheel-coach']).toBe('done')
  })

  it('advances on the input each step asks for and holds stray presses', () => {
    const at = (step: 'scroll' | 'select' | 'back') => ({ step, nudges: 0 })
    expect(coachIntercepts(at('scroll'), 'move')).toBe('advance')
    expect(coachIntercepts(at('scroll'), 'select')).toBe('hold')
    expect(coachIntercepts(at('scroll'), 'press')).toBe('hold')
    expect(coachIntercepts(at('select'), 'select')).toBe('advance')
    expect(coachIntercepts(at('select'), 'move')).toBe('pass')
    expect(coachIntercepts(at('select'), 'press')).toBe('hold')
    expect(coachIntercepts(at('back'), 'back')).toBe('advance')
    expect(coachIntercepts(at('back'), 'move')).toBe('pass')
    expect(coachIntercepts(at('back'), 'select')).toBe('pass')
    expect(coachIntercepts(at('back'), 'press')).toBe('hold')
    const done = { step: null, nudges: 0 }
    for (const input of ['move', 'select', 'back', 'press'] as const) expect(coachIntercepts(done, input)).toBe('pass')
  })

  it('never traps anyone: Back skips the early steps, and a press after two held ones goes through', () => {
    expect(coachIntercepts({ step: 'scroll', nudges: 0 }, 'back')).toBe('skip')
    expect(coachIntercepts({ step: 'select', nudges: 0 }, 'back')).toBe('skip')
    for (const step of ['scroll', 'select', 'back'] as const) {
      expect(coachIntercepts({ step, nudges: MAX_HELD_PRESSES - 1 }, 'press')).toBe('hold')
      expect(coachIntercepts({ step, nudges: MAX_HELD_PRESSES }, 'press')).toBe('release')
    }
  })

  it('Settings › Wheel Tutorial restarts it', () => {
    wheelCoach.end()
    runMenuAction({ type: 'wheel-tutorial' })
    expect(wheelCoach.get()).toEqual({ step: 'scroll', nudges: 0 })
  })

  it('can be replayed from Settings', () => {
    const settings = menuTree.children.find((n) => n.id === 'settings')
    const row = settings?.kind === 'menu' ? settings.children.at(-1) : undefined
    expect(row).toMatchObject({ label: 'Wheel Tutorial', action: { type: 'wheel-tutorial' } })
  })
})
