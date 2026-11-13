import { afterEach, describe, expect, it, vi } from 'vitest'
import { menuTree } from '../data'
import { coachIntercepts, createWheelCoach } from '../state/wheelCoach'

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
    coach.step()
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
    coach.step()
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
    expect(() => coach.step()).not.toThrow()
    expect(coach.get().active).toBe(false)
  })

  it('lets scrolling through (ending the hint) and holds every other press while showing', () => {
    const showing = { active: true, nudges: 0 }
    const done = { active: false, nudges: 0 }
    expect(coachIntercepts(showing, 'move')).toBe('step')
    expect(coachIntercepts(showing, 'press')).toBe('hold')
    expect(coachIntercepts(done, 'move')).toBe('pass')
    expect(coachIntercepts(done, 'press')).toBe('pass')
  })

  it('can be replayed from Settings', () => {
    const settings = menuTree.children.find((n) => n.id === 'settings')
    const row = settings?.kind === 'menu' ? settings.children.at(-1) : undefined
    expect(row).toMatchObject({ label: 'Wheel Tutorial', action: { type: 'wheel-tutorial' } })
  })
})
