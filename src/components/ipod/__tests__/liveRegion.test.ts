import { describe, expect, it } from 'vitest'
import { portfolio } from '../../../data/portfolio'
import { initialLiveRegion, nextLiveRegion, type LiveRegion, type LiveRegionInput } from '../state/liveRegion'

const track = portfolio.nowBuilding[0]
const input = (announcement: string, overrides: Partial<LiveRegionInput> = {}): LiveRegionInput => ({
  announcement,
  status: 'stopped',
  track,
  sliderFocused: false,
  ...overrides,
})

describe('device live region', () => {
  const start = initialLiveRegion('Giancarlo: Projects, submenu, 1 of 6', 'stopped')

  it('starts silent and keeps the same state while nothing changes', () => {
    expect(start.text).toBe('')
    expect(nextLiveRegion(start, input(start.announcement))).toBe(start)
  })

  it('speaks navigation changes while the slider is not focused', () => {
    const next = nextLiveRegion(start, input('Giancarlo: Experience, submenu, 2 of 6'))
    expect(next.text).toBe('Giancarlo: Experience, submenu, 2 of 6')
  })

  it('stays quiet about navigation while the slider (its valuetext) is speaking', () => {
    const next = nextLiveRegion(start, input('Giancarlo: Experience, submenu, 2 of 6', { sliderFocused: true }))
    expect(next.text).toBe('')
  })

  it('never re-announces when focus moves on or off the slider', () => {
    let region: LiveRegion = nextLiveRegion(start, input('Giancarlo: Experience, submenu, 2 of 6'))
    const spoken = region.text
    for (const sliderFocused of [true, false, true, false]) {
      region = nextLiveRegion(region, input('Giancarlo: Experience, submenu, 2 of 6', { sliderFocused }))
      expect(region.text).toBe(spoken)
    }
    // Moved while focused, then blurred: the old text is not put back.
    region = nextLiveRegion(region, input('Giancarlo: About Me, opens page, 3 of 6', { sliderFocused: true }))
    region = nextLiveRegion(region, input('Giancarlo: About Me, opens page, 3 of 6'))
    expect(region.text).toBe('')
  })

  it('always speaks play/pause, even with the slider focused', () => {
    let region = nextLiveRegion(start, input(start.announcement, { status: 'playing', sliderFocused: true }))
    expect(region.text).toBe(`Playing ${track.title}`)
    region = nextLiveRegion(region, input(start.announcement, { status: 'paused' }))
    expect(region.text).toBe('Paused')
  })

  it('prefers the playback change when navigation changes in the same update', () => {
    const region = nextLiveRegion(start, input('Giancarlo: Projects, submenu, 1 of 7', { status: 'playing' }))
    expect(region.text).toBe(`Playing ${track.title}`)
    expect(nextLiveRegion(region, input('Giancarlo: Projects, submenu, 1 of 7', { status: 'playing' }))).toBe(region)
  })
})
