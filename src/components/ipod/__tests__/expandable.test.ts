import { describe, expect, it } from 'vitest'
import { canExpand } from '../expandable'

describe('canExpand', () => {
  it('offers the reader on screens with something to read', () => {
    expect(canExpand({ type: 'project', projectId: 'x' })).toBe(true)
    expect(canExpand({ type: 'experience', experienceId: 'x' })).toBe(true)
    expect(canExpand({ type: 'about' })).toBe(true)
    expect(canExpand({ type: 'resume' })).toBe(true)
  })

  it('keeps the iPod-only screens to the iPod', () => {
    expect(canExpand({ type: 'cover-flow' })).toBe(false)
    expect(canExpand({ type: 'now-playing' })).toBe(false)
    expect(canExpand({ type: 'about-portfolio' })).toBe(false)
  })
})
