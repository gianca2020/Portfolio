import { describe, expect, it } from 'vitest'
import { CHASSIS_THEMES, nextTheme, parseTheme, themeLabel } from '../state/settingsContext'

describe('chassis finish cycle', () => {
  it('offers the three 6th-generation finishes', () => {
    expect(CHASSIS_THEMES).toEqual(['silver', 'black', 'pink'])
  })

  it('cycles silver → black → pink → silver', () => {
    expect(nextTheme('silver')).toBe('black')
    expect(nextTheme('black')).toBe('pink')
    expect(nextTheme('pink')).toBe('silver')
  })

  it('labels each finish for the Settings row', () => {
    expect(themeLabel('silver')).toBe('Silver')
    expect(themeLabel('black')).toBe('Black')
    expect(themeLabel('pink')).toBe('Pink')
  })
})

describe('parseTheme', () => {
  it('keeps a valid persisted finish', () => {
    expect(parseTheme('silver')).toBe('silver')
    expect(parseTheme('black')).toBe('black')
    expect(parseTheme('pink')).toBe('pink')
  })

  it('falls back to the default for anything else', () => {
    expect(parseTheme('gold')).toBe('silver')
    expect(parseTheme(undefined)).toBe('silver')
    expect(parseTheme(42)).toBe('silver')
  })
})
