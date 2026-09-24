import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { portfolio } from '../../../data/portfolio'
import { Artwork } from '../Artwork'
import { menuTree, nodeIndex } from '../data'
import { Glyph } from '../icons'
import { MenuScreen } from '../Menu'
import { Preview } from '../Preview'
import { ScreenStack } from '../Screen'
import { Scrollbar } from '../Scrollbar'
import { StatusBar } from '../StatusBar'
import { DeviceActiveContext } from '../state/deviceContext'
import { PlaybackContext, type PlaybackValue } from '../state/playbackContext'
import { DEFAULT_SETTINGS, SettingsContext, type SettingsValue } from '../state/settingsContext'
import type { MenuNode, PreviewIcon, PreviewSpec, ScreenApi } from '../types'

const settings: SettingsValue = {
  settings: DEFAULT_SETTINGS,
  reducedMotion: false,
  toggle: () => {},
  describe: (key) => (key === 'theme' ? 'Silver' : key === 'sound' ? 'On' : 'Off'),
}

const playback = (started: boolean): PlaybackValue => ({
  status: started ? 'playing' : 'stopped',
  started,
  tracks: portfolio.nowBuilding,
  trackIndex: 0,
  track: portfolio.nowBuilding[0],
  volume: 0.5,
  getElapsed: () => 0,
  toggle: () => {},
  skip: () => {},
  setVolume: () => {},
})

const api: ScreenApi = {
  register: () => () => {},
  setIndex: () => {},
  selectIndex: () => {},
  open: () => {},
  activate: () => {},
  runAction: () => {},
  click: () => {},
}

function render(node: ReactNode, { started = false, reducedMotion = false } = {}) {
  return renderToStaticMarkup(
    <SettingsContext.Provider value={{ ...settings, reducedMotion }}>
      <PlaybackContext.Provider value={playback(started)}>{node}</PlaybackContext.Provider>
    </SettingsContext.Provider>,
  )
}

const menu = (id: string) => nodeIndex.get(id) as MenuNode
const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0

describe('StatusBar', () => {
  it('is decorative, centred and spans half the LCD in split view', () => {
    const html = render(<StatusBar title="Giancarlo" playback="stopped" layout="split" />)
    expect(html).toMatch(/^<div aria-hidden="true"[^>]*lcd-statusbar/)
    expect(html).toContain('width:160px')
    expect(html).toContain('Giancarlo')
    expect(html).toContain('viewBox="0 0 26 13"')
  })

  const PLAY = 'M0 0 11 6 0 12Z'
  const PAUSE = 'M1 0h3.6v12H1z'
  const IDLE = 'M.75.95 9.85 6 .75 11.05Z'

  it('shows play only while playing, and spans the LCD in full view', () => {
    const playing = render(<StatusBar title="Now Playing" playback="playing" layout="full" />)
    expect(playing).toContain('width:320px')
    expect(playing).toContain(PLAY)
    expect(playing).not.toContain(PAUSE)
    const paused = render(<StatusBar title="Now Playing" playback="paused" layout="full" />)
    expect(paused).toContain(PAUSE)
    expect(paused).not.toContain(PLAY)
  })

  it('shows an idle outline, not pause, before anything has played', () => {
    const stopped = render(<StatusBar title="Giancarlo" playback="stopped" layout="split" />)
    expect(stopped).toContain(IDLE)
    expect(stopped).not.toContain(PLAY)
    expect(stopped).not.toContain(PAUSE)
  })

  it('does not animate its width under reduced motion', () => {
    expect(render(<StatusBar title="x" playback="paused" layout="full" />, { reducedMotion: true })).toContain(
      'transition:none',
    )
  })
})

describe('MenuScreen', () => {
  it('renders the root as a split listbox with the first row selected and a preview', () => {
    const html = render(<MenuScreen node={menuTree} index={0} active api={api} />)
    expect(html).toContain('role="listbox"')
    expect(html).toContain(`aria-label="${menuTree.title}"`)
    expect(count(html, /role="option"/g)).toBe(menuTree.children.length - 1) // Now Playing hidden
    expect(count(html, /aria-selected="true"/g)).toBe(1)
    expect(html).toMatch(/aria-selected="true"[^>]*lcd-selected[^>]*><span[^>]*><span[^>]*>Projects</)
    expect(html).toContain('lcd-split-panel')
    // Projects is highlighted: its slideshow drifts behind the list.
    expect(html).toContain('lcd-kenburns')
  })

  it('lists Now Playing once playback has started', () => {
    const html = render(<MenuScreen node={menuTree} index={0} active api={api} />, { started: true })
    expect(count(html, /role="option"/g)).toBe(menuTree.children.length)
  })

  it('shows chevrons on rows that open screens and values on setting rows', () => {
    const html = render(<MenuScreen node={menu('settings')} index={0} active api={api} />)
    expect(html).toMatch(/Sound<\/span><\/span><span[^>]*>On<\/span>/)
    expect(html).toMatch(/Theme<\/span><\/span><span[^>]*>Silver<\/span>/)
    // Only "About This Portfolio" opens a screen.
    expect(count(html, /viewBox="0 0 8 13"/g)).toBe(1)
  })

  it('draws no chevrons on action rows', () => {
    const html = render(<MenuScreen node={menu('contact')} index={0} active api={api} />)
    expect(count(html, /viewBox="0 0 8 13"/g)).toBe(0)
  })

  it('scrolls long lists with a scrollbar, keeping every row in the DOM', () => {
    const long: MenuNode = {
      ...menu('settings'),
      id: 'long',
      layout: 'full',
      children: Array.from({ length: 14 }, (_, i) => ({
        kind: 'action' as const,
        id: `long/${i}`,
        label: `Row ${i}`,
        action: { type: 'recruiter-view' as const },
      })),
    }
    const html = render(<MenuScreen node={long} index={12} active api={api} />)
    expect(count(html, /role="option"/g)).toBe(14)
    expect(html).toContain('lcd-scrollbar')
    // Window starts at row 4: row 12 sits in the last slot (196px from the top).
    expect(html).toMatch(/top:196px;height:24px"[^>]*><span[^>]*><span[^>]*>Row 12</)
  })

  it('ellipsises labels until a highlighted one is measured for the marquee', () => {
    const html = render(<MenuScreen node={menu('settings')} index={3} active api={api} />)
    // The label box clips with an ellipsis; its text stays inline (only a running marquee makes it a block).
    expect(html).toMatch(/aria-selected="true"[^>]*><span class="[^"]*text-ellipsis[^"]*"><span>About This Portfolio</)
    expect(html).not.toContain('inline-block')
  })
})

describe('Preview', () => {
  const specs: PreviewSpec[] = [
    { type: 'slideshow', artworks: portfolio.projects.map((p) => p.artwork), title: 'Projects', caption: '3 projects' },
    { type: 'artwork', artwork: portfolio.projects[0].artwork, title: 'Cover' },
    { type: 'project', projectId: portfolio.projects[0].id },
    { type: 'experience', experienceId: portfolio.experience[0].id },
    { type: 'profile' },
    { type: 'info', icon: 'mail', title: 'Email', detail: 'me@example.com', hint: 'Opens your mail app' },
    { type: 'setting', setting: 'theme' },
    { type: 'now-playing' },
  ]

  it.each(specs)('renders a $type preview', (spec) => {
    const html = render(<Preview spec={spec} label="Label" />)
    expect(html.length).toBeGreaterThan(100)
  })

  it('shows the project name, tagline and primary stack', () => {
    const project = portfolio.projects[0]
    const html = render(<Preview spec={{ type: 'project', projectId: project.id }} />)
    expect(html).toContain(project.name)
    expect(html).toContain(project.tagline)
    expect(html).toContain(project.stack.slice(0, 3).join(' · '))
  })

  it.each(portfolio.projects)('lists only whole technologies for $name', (project) => {
    const html = render(<Preview spec={{ type: 'project', projectId: project.id }} />)
    const line = html.match(/font-bold text-lcd-ink-2">([^<]*)</)?.[1] ?? ''
    const items = line.split(' · ')
    expect(items.length).toBeGreaterThan(0)
    expect(items).toEqual(project.stack.slice(0, items.length))
  })

  it.each(portfolio.experience)('names the organisation and the whole role for $menuLabel', (experience) => {
    const html = render(<Preview spec={{ type: 'experience', experienceId: experience.id }} />)
    expect(html).toContain(experience.role)
    expect(html).toContain(`${experience.start} – ${experience.end}`)
    // The full name when it fits in two lines, else the short menu label; never a fragment of either.
    const org = html.match(/<p class="font-bold [^"]*" style="font-size:\d+px;line-height:\d+px">([^<]*)</)?.[1]
    expect([experience.organization, experience.menuLabel]).toContain(org)
  })

  it('falls back to the short name only when the full one cannot fit', () => {
    const byId = (id: string) => render(<Preview spec={{ type: 'experience', experienceId: id }} />)
    expect(byId('cuny-financial-aid')).toContain('>CUNY Financial Aid<')
    expect(byId('qc-cs-club')).toContain('>Queens College Computer Science Club<')
  })

  it('reads out a setting value', () => {
    const html = render(<Preview spec={{ type: 'setting', setting: 'theme' }} label="Theme" />)
    expect(html).toContain('Silver')
    expect(html).toContain('Theme')
  })

  it('falls back to a slate panel with the row label for unknown content', () => {
    const html = render(<Preview spec={{ type: 'project', projectId: 'nope' }} label="Mystery" />)
    expect(html).toContain('lcd-slate')
    expect(html).toContain('Mystery')
  })

  it('holds still under reduced motion', () => {
    const spec = specs[0]
    expect(render(<Preview spec={spec} />)).toContain('lcd-kenburns')
    expect(render(<Preview spec={spec} />, { reducedMotion: true })).not.toContain('lcd-kenburns')
  })
})

describe('Artwork', () => {
  it('draws a deterministic, decorative generated cover that fills its box', () => {
    const spec = portfolio.projects[0].artwork
    const a = renderToStaticMarkup(<Artwork spec={spec} className="h-full w-full" />)
    // Phrasing content only, so a cover can sit inside a <button> (Cover Flow).
    expect(a).toMatch(/^<span class="block overflow-hidden h-full w-full" aria-hidden="true">/)
    expect(a).not.toContain('<div')
    expect(a).toContain('preserveAspectRatio="xMidYMid slice"')
    expect(a).toContain(`>${spec.monogram}</text>`)
    expect(renderToStaticMarkup(<Artwork spec={spec} className="h-full w-full" />)).toBe(a)
  })

  it('lays out a 2 : 3 sleeve for the full-height preview panel', () => {
    const spec = portfolio.projects[0].artwork
    const html = renderToStaticMarkup(<Artwork spec={spec} format="portrait" className="h-full w-full" />)
    expect(html).toContain('viewBox="0 0 100 150"')
    expect(html).toContain('y="100"')
  })

  it('holds its Ken Burns drift while the device is hidden', () => {
    const spec = portfolio.projects[0].artwork
    const drifting = <Artwork spec={spec} kenBurns />
    expect(renderToStaticMarkup(drifting)).not.toContain('animation-play-state')
    const hidden = renderToStaticMarkup(
      <DeviceActiveContext.Provider value={false}>{drifting}</DeviceActiveContext.Provider>,
    )
    expect(hidden).toMatch(/class="[^"]*lcd-kenburns[^"]*" style="animation-play-state:paused"/)
  })

  it('shows an image with its alt text when one is set', () => {
    const html = renderToStaticMarkup(
      <Artwork spec={{ ...portfolio.projects[0].artwork, image: '/shot.png', imageAlt: 'Screenshot' }} />,
    )
    expect(html).toContain('alt="Screenshot"')
    expect(html).not.toContain('aria-hidden')
  })
})

describe('icons and scrollbar', () => {
  const icons: PreviewIcon[] = [
    'github',
    'linkedin',
    'mail',
    'download',
    'document',
    'recruiter',
    'external',
    'settings',
    'sound',
    'theme',
    'motion',
    'info',
  ]

  it.each(icons)('draws the %s glyph, plain and glossy', (icon) => {
    const plain = renderToStaticMarkup(<Glyph icon={icon} className="h-[14px] w-[14px]" />)
    expect(plain).toMatch(/<svg viewBox="0 0 24 24" aria-hidden="true"/)
    expect(plain).toContain('currentColor')
    const glossy = renderToStaticMarkup(<Glyph icon={icon} glossy />)
    expect(glossy).toContain('-gloss)')
  })

  it('draws a scrollbar only when content overflows', () => {
    expect(renderToStaticMarkup(<Scrollbar total={5} visible={9} offset={0} />)).toBe('')
    const html = renderToStaticMarkup(<Scrollbar total={18} visible={9} offset={9} />)
    expect(html).toContain('lcd-scrollbar')
    expect(html).toContain('max(10px')
  })
})

describe('ScreenStack', () => {
  it('renders the current screen as active, below the status bar', () => {
    const html = render(<ScreenStack node={menuTree} index={1} depth={0} direction={1} api={api} />)
    expect(html).toContain('pt-[20px]')
    // Each slot clips like a whole frame (the split panel's shadow stays on its own screen).
    expect(html).toMatch(/class="absolute inset-0 overflow-hidden bg-lcd pt-\[20px\]"/)
    expect(html).toContain('role="listbox"')
    expect(html).not.toMatch(/^[^>]*aria-hidden/)
  })

  // Screens speak through describe() and the device's one live region, never a region of their own.
  const screens = [...nodeIndex.values()].filter((node) => node.kind === 'screen')
  it.each(screens.map((node) => [node.id, node]))('renders %s without a live region of its own', (_, node) => {
    const html = render(<ScreenStack node={node} index={0} depth={1} direction={1} api={api} />, { started: true })
    expect(html).toContain('<section')
    expect(html).not.toContain('aria-live')
  })
})
