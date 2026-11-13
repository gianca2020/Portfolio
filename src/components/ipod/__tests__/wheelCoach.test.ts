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
    expect(createWheelCoach().get().active).toBe(true)
    vi.stubGlobal('window', { localStorage: storage({ 'gf-ipod-portfolio:wheel-coach': 'done' }) })
    expect(createWheelCoach().get().active).toBe(false)
  })

  it('ends on the first scroll and remembers it', () => {
    const localStorage = storage()
    vi.stubGlobal('window', { localStorage })
    const coach = createWheelCoach()
    const seen: boolean[] = []
    coach.subscribe(() => seen.push(coach.get().active))
    coach.end()
    expect(coach.get().active).toBe(false)
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
    expect(coach.get()).toEqual({ active: false, nudges: 2 })
    coach.start()
    expect(coach.get()).toEqual({ active: true, nudges: 0 })
  })

  it('tolerates blocked storage', () => {
    const throws = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('window', { localStorage: { getItem: throws, setItem: throws } })
    const coach = createWheelCoach()
    expect(coach.get().active).toBe(true)
    expect(() => coach.end()).not.toThrow()
    expect(coach.get().active).toBe(false)
  })

  it('lets scrolling through (ending the hint) and holds other presses while showing', () => {
    const showing = { active: true, nudges: 0 }
    const done = { active: false, nudges: 0 }
    expect(coachIntercepts(showing, 'move')).toBe('step')
    expect(coachIntercepts(showing, 'press')).toBe('hold')
    expect(coachIntercepts(done, 'move')).toBe('pass')
    expect(coachIntercepts(done, 'press')).toBe('pass')
    expect(coachIntercepts(done, 'back')).toBe('pass')
  })

  it('never traps anyone: Back skips it, and a press after two held ones goes through', () => {
    expect(coachIntercepts({ active: true, nudges: 0 }, 'back')).toBe('skip')
    expect(coachIntercepts({ active: true, nudges: MAX_HELD_PRESSES - 1 }, 'press')).toBe('hold')
    expect(coachIntercepts({ active: true, nudges: MAX_HELD_PRESSES }, 'press')).toBe('release')
  })

  it('Settings › Wheel Tutorial restarts it', () => {
    wheelCoach.end()
    runMenuAction({ type: 'wheel-tutorial' })
    expect(wheelCoach.get()).toEqual({ active: true, nudges: 0 })
  })

  it('can be replayed from Settings', () => {
    const settings = menuTree.children.find((n) => n.id === 'settings')
    const row = settings?.kind === 'menu' ? settings.children.at(-1) : undefined
    expect(row).toMatchObject({ label: 'Wheel Tutorial', action: { type: 'wheel-tutorial' } })
  })
})
