import { describe, expect, it } from 'vitest'
import { portfolio } from '../../../data/portfolio'
import { buildMenuTree, getVisibleChildren, indexTree, menuTree } from '../data'
import { clampIndex, currentLevel, initialNavigation, navigationReducer } from '../navigation'

describe('navigationReducer', () => {
  const root = initialNavigation('root')

  it('moves the highlight and clamps at both ends (no wrap)', () => {
    let s = navigationReducer(root, { type: 'move', delta: 1, count: 3 })
    expect(currentLevel(s).index).toBe(1)
    s = navigationReducer(s, { type: 'move', delta: 5, count: 3 })
    expect(currentLevel(s).index).toBe(2)
    s = navigationReducer(s, { type: 'move', delta: -9, count: 3 })
    expect(currentLevel(s).index).toBe(0)
  })

  it('returns the same state object when nothing changes', () => {
    expect(navigationReducer(root, { type: 'move', delta: -1, count: 3 })).toBe(root)
    expect(navigationReducer(root, { type: 'pop' })).toBe(root)
    expect(navigationReducer(root, { type: 'reset' })).toBe(root)
  })

  it('push starts the new level at index 0 and records forward direction', () => {
    const moved = navigationReducer(root, { type: 'move', delta: 2, count: 6 })
    const pushed = navigationReducer(moved, { type: 'push', nodeId: 'contact' })
    expect(pushed.history).toEqual([
      { nodeId: 'root', index: 2 },
      { nodeId: 'contact', index: 0 },
    ])
    expect(pushed.direction).toBe(1)
  })

  it('pop restores the parent highlight and records back direction', () => {
    let s = navigationReducer(root, { type: 'move', delta: 4, count: 6 })
    s = navigationReducer(s, { type: 'push', nodeId: 'contact' })
    s = navigationReducer(s, { type: 'move', delta: 2, count: 4 })
    s = navigationReducer(s, { type: 'pop' })
    expect(s.history).toEqual([{ nodeId: 'root', index: 4 }])
    expect(s.direction).toBe(-1)
  })

  it('ignores a duplicate push of the node already on screen', () => {
    const s = navigationReducer(root, { type: 'push', nodeId: 'projects' })
    expect(navigationReducer(s, { type: 'push', nodeId: 'projects' })).toBe(s)
  })

  it('reset returns to root keeping the root highlight', () => {
    let s = navigationReducer(root, { type: 'move', delta: 1, count: 6 })
    s = navigationReducer(s, { type: 'push', nodeId: 'experience' })
    s = navigationReducer(s, { type: 'push', nodeId: 'experience/puberry' })
    s = navigationReducer(s, { type: 'reset' })
    expect(s.history).toEqual([{ nodeId: 'root', index: 1 }])
  })

  it('clampIndex handles empty lists', () => {
    expect(clampIndex(3, 0)).toBe(0)
    expect(clampIndex(-1, 4)).toBe(0)
    expect(clampIndex(9, 4)).toBe(3)
  })
})

describe('menu tree', () => {
  it('has the spec’d root menu', () => {
    expect(getVisibleChildren(menuTree, false).map((n) => n.label)).toEqual([
      'Projects',
      'Experience',
      'About Me',
      'Resume',
      'Contact',
      'Settings',
    ])
  })

  it('adds Now Playing once playback has started', () => {
    expect(getVisibleChildren(menuTree, true).at(-1)?.label).toBe('Now Playing')
  })

  it('has unique ids and every project/role reachable', () => {
    const index = indexTree(menuTree)
    expect(index.get('projects/polly-debate-ai')?.kind).toBe('screen')
    expect(index.get('projects/all')?.kind).toBe('screen')
    expect(index.get('experience/qc-cs-club')?.label).toBe('Leadership')
    expect(index.get('contact/github')?.kind).toBe('action')
  })

  it('pluralizes the Projects and Experience slideshow captions', () => {
    const caption = (projects: number, experience: number) => {
      const index = indexTree(
        buildMenuTree({
          ...portfolio,
          projects: portfolio.projects.slice(0, projects),
          experience: portfolio.experience.slice(0, experience),
        }),
      )
      const captionOf = (id: string) => {
        const preview = index.get(id)?.preview
        return preview?.type === 'slideshow' ? preview.caption : undefined
      }
      return [captionOf('projects'), captionOf('experience')]
    }
    expect(caption(1, 1)).toEqual(['1 project', '1 role'])
    expect(caption(3, 2)).toEqual(['3 projects', '2 roles'])
    expect(caption(0, 0)).toEqual(['No projects yet', 'No roles yet'])
  })
})
