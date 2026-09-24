import { describe, expect, it } from 'vitest'
import { getVisibleChildren, menuTree, nodeIndex } from '../data'
import type { IPodNode, NavigableNode, SettingKey } from '../types'
import { keyCommand, spokenState } from '../useIPodEngine'

const press = (key: string, options: { repeat?: boolean; enterActivates?: boolean; spaceActivates?: boolean } = {}) =>
  keyCommand({ key, repeat: false, enterActivates: false, spaceActivates: false, ...options })

describe('keyCommand', () => {
  it('maps the documented shortcuts', () => {
    expect(press('ArrowUp')).toBe('up')
    expect(press('ArrowDown')).toBe('down')
    expect(press('ArrowRight')).toBe('select')
    expect(press('Enter')).toBe('select')
    expect(press('ArrowLeft')).toBe('back')
    expect(press('Escape')).toBe('back')
    expect(press(' ')).toBe('play-pause')
    expect(press('Home')).toBe('home')
    expect(press('Tab')).toBeNull()
    expect(press('a')).toBeNull()
  })

  it('swallows auto-repeat of one-shot keys, even on a focused button or link', () => {
    for (const key of ['Enter', 'ArrowRight', ' ', 'Home']) {
      expect(press(key, { repeat: true })).toBe('swallow')
      expect(press(key, { repeat: true, enterActivates: true, spaceActivates: true })).toBe('swallow')
    }
  })

  it('keeps repeating the keys that only move through the tree', () => {
    expect(press('ArrowUp', { repeat: true })).toBe('up')
    expect(press('ArrowDown', { repeat: true })).toBe('down')
    expect(press('ArrowLeft', { repeat: true })).toBe('back')
    expect(press('Escape', { repeat: true })).toBe('back')
    expect(press('Tab', { repeat: true })).toBeNull()
  })

  it('leaves Enter to a focused button or link', () => {
    expect(press('Enter', { enterActivates: true })).toBeNull()
  })

  it('leaves Space to a focused button, but plays/pauses on a focused link (Space never activates links)', () => {
    expect(press(' ', { enterActivates: true, spaceActivates: true })).toBeNull()
    expect(press(' ', { enterActivates: true, spaceActivates: false })).toBe('play-pause')
  })
})

describe('spokenState', () => {
  const settingValue = (key: SettingKey) => (key === 'theme' ? 'Silver' : key === 'sound' ? 'Off' : 'On')
  const node = (id: string) => nodeIndex.get(id) as NavigableNode
  const menu = (id: string, index: number) => {
    const open = node(id)
    const rows: IPodNode[] = open.kind === 'menu' ? getVisibleChildren(open, false) : []
    return spokenState({
      node: open,
      highlighted: rows[index],
      index,
      count: rows.length,
      screenDescription: undefined,
      settingValue,
    })
  }

  it('names the menu in both the slider value and the announcement', () => {
    expect(menu('root', 0)).toEqual({
      valueText: 'Projects, submenu, 1 of 6, Giancarlo',
      announcement: 'Giancarlo: Projects, submenu, 1 of 6',
    })
    expect(menu('projects', 0).valueText).toMatch(/, 1 of \d+, Projects$/)
  })

  it('says a content row opens a page, not a menu', () => {
    expect(menu('root', 2).announcement).toBe('Giancarlo: About Me, opens page, 3 of 6')
  })

  it('includes a setting’s current value', () => {
    expect(menu('settings', 0).announcement).toBe('Settings: Sound, Off, 1 of 4')
    expect(menu('settings', 1).valueText).toBe('Theme, Silver, 2 of 4, Settings')
  })

  it('says nothing extra for action rows', () => {
    expect(menu('contact', 0).announcement).toBe('Contact: GitHub, 1 of 4')
  })

  it('uses the screen’s own description when it has one, still naming the screen', () => {
    const coverFlow = node('projects/all')
    const spoken = spokenState({
      node: coverFlow,
      highlighted: undefined,
      index: 1,
      count: 4,
      screenDescription: 'UP! Investments, 2 of 4',
      settingValue,
    })
    // Same order as a menu row: the item and its position first, the screen's name last.
    expect(spoken).toEqual({
      valueText: 'UP! Investments, 2 of 4, Cover Flow',
      announcement: 'Cover Flow: UP! Investments, 2 of 4',
    })
  })

  it('falls back to the screen’s position, and keeps the announcement still between plain positions', () => {
    const about = node('about')
    const at = (index: number) =>
      spokenState({ node: about, highlighted: undefined, index, count: 5, screenDescription: undefined, settingValue })
    expect(at(1).valueText).toBe('About Me, position 2 of 5')
    expect(at(1).announcement).toBe('About Me')
    expect(at(2).announcement).toBe(at(1).announcement)
  })

  it('reads an empty menu by its title', () => {
    const empty = { node: menuTree, highlighted: undefined, index: 0, count: 0, screenDescription: undefined, settingValue }
    expect(spokenState(empty)).toEqual({ valueText: 'Giancarlo', announcement: 'Giancarlo' })
  })
})
