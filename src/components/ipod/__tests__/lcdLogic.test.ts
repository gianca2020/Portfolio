import { describe, expect, it } from 'vitest'
import { portfolio } from '../../../data/portfolio'
import type { ArtworkMotif } from '../../../data/types'
import { MENU_VISIBLE_ROWS, SCREEN_HEIGHT } from '../constants'
import { CARD_TEXT_HEIGHT, CARD_TEXT_WIDTH, experienceCardLayout } from '../lcd/cardLayout'
import { firstLayer, pushLayer, settleLayers } from '../lcd/layers'
import { MARQUEE_REST_MS, MARQUEE_SPEED, marqueeShift, marqueeTimeline } from '../lcd/marquee'
import { nextWindowStart, rowHeight, rowTop, scrollbarThumb } from '../lcd/menuWindow'
import { MONOGRAM, monogramSize, motifShapes } from '../lcd/motifs'
import { cycleItem, kenBurnsPan, kenBurnsVars } from '../lcd/motion'
import { previewKey } from '../lcd/previewKey'
import { fitFontSize, fitJoined, fitsInLines, helveticaBoldEm, helveticaEm, wrapWords } from '../lcd/textMetrics'

describe('menu window', () => {
  it('keeps the window still while the highlight moves inside it', () => {
    for (let i = 0; i < MENU_VISIBLE_ROWS; i++) expect(nextWindowStart(0, i, 15)).toBe(0)
  })

  it('scrolls one row at a time once the highlight passes the bottom edge', () => {
    expect(nextWindowStart(0, 9, 15)).toBe(1)
    expect(nextWindowStart(1, 10, 15)).toBe(2)
    // Moving back up inside the window does not scroll.
    expect(nextWindowStart(2, 5, 15)).toBe(2)
  })

  it('scrolls up when the highlight passes the top edge', () => {
    expect(nextWindowStart(4, 3, 15)).toBe(3)
    expect(nextWindowStart(4, 0, 15)).toBe(0)
  })

  it('jumps straight to a distant highlight and clamps at both ends', () => {
    expect(nextWindowStart(0, 14, 15)).toBe(6)
    expect(nextWindowStart(20, 14, 15)).toBe(6)
    expect(nextWindowStart(-3, 0, 15)).toBe(0)
  })

  it('never scrolls a list that fits', () => {
    expect(nextWindowStart(0, 6, 7)).toBe(0)
    expect(nextWindowStart(3, 2, 7)).toBe(0)
    expect(nextWindowStart(0, 0, 0)).toBe(0)
  })

  it('lays nine whole-pixel rows into 220px, alternating 24 / 25', () => {
    const heights = Array.from({ length: MENU_VISIBLE_ROWS }, (_, i) => rowHeight(i))
    expect(heights).toEqual([24, 25, 24, 25, 24, 25, 24, 25, 24])
    expect(rowTop(0)).toBe(0)
    expect(rowTop(MENU_VISIBLE_ROWS)).toBe(SCREEN_HEIGHT)
    expect(rowTop(-1)).toBe(-24)
  })
})

describe('scrollbar thumb', () => {
  it('is absent when everything fits', () => {
    expect(scrollbarThumb(9, 9, 0)).toBeNull()
    expect(scrollbarThumb(0, 9, 0)).toBeNull()
    expect(scrollbarThumb(Number.NaN, 9, 0)).toBeNull()
  })

  it('sizes the thumb to the visible fraction and places it along its travel', () => {
    expect(scrollbarThumb(18, 9, 0)).toEqual({ size: 0.5, position: 0 })
    expect(scrollbarThumb(18, 9, 9)).toEqual({ size: 0.5, position: 1 })
    expect(scrollbarThumb(400, 200, 50)).toEqual({ size: 0.5, position: 0.25 })
    expect(scrollbarThumb(400, 200, 999)?.position).toBe(1)
  })
})

describe('cross-fade layers', () => {
  const base = firstLayer('a', 1)

  it('starts with one layer that does not fade', () => {
    expect(base).toEqual([{ key: 'a', id: 0, value: 1, fade: false }])
  })

  it('stacks a new key on top and ignores the current key', () => {
    const next = pushLayer(base, 'b', 2, true)
    expect(next.map((l) => [l.key, l.id, l.fade])).toEqual([
      ['a', 0, false],
      ['b', 1, true],
    ])
    expect(pushLayer(next, 'b', 3, true)).toBe(next)
  })

  it('drops the oldest layers beyond the limit, and swaps outright with a limit of one', () => {
    const three = pushLayer(pushLayer(pushLayer(base, 'b', 2, true, 3), 'c', 3, true, 3), 'd', 4, true, 3)
    expect(three.map((l) => l.key)).toEqual(['b', 'c', 'd'])
    expect(pushLayer(base, 'b', 2, false, 1)).toEqual([{ key: 'b', id: 1, value: 2, fade: false }])
  })

  it('gives a returning key a fresh layer id so it fades in again', () => {
    const back = pushLayer(pushLayer(base, 'b', 2, true), 'a', 1, true)
    expect(back.map((l) => [l.key, l.id])).toEqual([
      ['b', 1],
      ['a', 2],
    ])
  })

  it('settles to the top layer only when the top layer finished, and stops it fading', () => {
    const next = pushLayer(base, 'b', 2, true)
    expect(settleLayers(next, 0)).toBe(next)
    // A settled layer that kept its fade-in would replay it when the LCD is shown again.
    expect(settleLayers(next, 1)).toEqual([{ ...next[1], fade: false }])
  })

  it('settles a lone fading layer, and leaves a settled one alone', () => {
    const fading = pushLayer(base, 'b', 2, true, 1)
    expect(fading).toEqual([{ key: 'b', id: 1, value: 2, fade: true }])
    const settled = settleLayers(fading, 1)
    expect(settled).toEqual([{ key: 'b', id: 1, value: 2, fade: false }])
    expect(settleLayers(settled, 1)).toBe(settled)
    expect(settleLayers(base, 0)).toBe(base)
  })
})

describe('marquee', () => {
  it('scrolls only a label wider than its box, by the overflow in LCD px', () => {
    expect(marqueeShift(100, 134, 134)).toBe(0)
    expect(marqueeShift(134, 134, 134)).toBe(0)
    expect(marqueeShift(153.8, 134, 134)).toBe(20)
    // Rendered at 2× by the LCD's transform: the same 20px of layout overflow.
    expect(marqueeShift(307.6, 268, 134)).toBe(20)
    // Hidden (display: none) boxes measure 0 and never scroll.
    expect(marqueeShift(0, 0, 0)).toBe(0)
  })

  it('rests, scrolls at a steady pace, rests, then loops back to the start', () => {
    const { keyframes, duration } = marqueeTimeline(30)
    const travel = (30 / MARQUEE_SPEED) * 1000
    expect(duration).toBe(MARQUEE_REST_MS * 2 + travel)
    expect(keyframes.map((k) => k.transform)).toEqual([
      'translateX(0px)',
      'translateX(0px)',
      'translateX(-30px)',
      'translateX(-30px)',
    ])
    expect(keyframes.map((k) => (k.offset ?? 0) * duration)).toEqual([
      0,
      MARQUEE_REST_MS,
      MARQUEE_REST_MS + travel,
      duration,
    ])
  })
})

describe('Ken Burns and slideshow helpers', () => {
  it('cycles items endlessly in both directions', () => {
    const items = ['a', 'b', 'c']
    expect([0, 1, 2, 3, 4, -1].map((n) => cycleItem(items, n))).toEqual(['a', 'b', 'c', 'a', 'b', 'c'])
    expect(cycleItem([], 3)).toBeUndefined()
  })

  it('varies the pan between consecutive covers and repeats after a cycle', () => {
    expect(kenBurnsPan(0)).not.toEqual(kenBurnsPan(1))
    expect(kenBurnsPan(4)).toEqual(kenBurnsPan(0))
    expect(kenBurnsPan(-1)).toEqual(kenBurnsPan(3))
  })

  it('never pans far enough to reveal an edge at the starting zoom', () => {
    for (const strength of ['full', 'subtle'] as const) {
      for (let n = 0; n < 4; n++) {
        const vars = kenBurnsVars(n, strength) as Record<string, string>
        const overhang = ((Number(vars['--kb-from']) - 1) / 2) * 100
        for (const key of ['--kb-x0', '--kb-y0', '--kb-x1', '--kb-y1']) {
          expect(Math.abs(parseFloat(vars[key]))).toBeLessThanOrEqual(overhang)
        }
        expect(Number(vars['--kb-to'])).toBeGreaterThan(Number(vars['--kb-from']))
      }
    }
  })
})

describe('Helvetica Bold metrics', () => {
  it('measures with the AFM advance widths', () => {
    expect(helveticaBoldEm('')).toBe(0)
    expect(helveticaBoldEm('A')).toBeCloseTo(0.722)
    expect(helveticaBoldEm('iPod')).toBeCloseTo(0.278 + 0.667 + 0.611 + 0.611)
    expect(helveticaBoldEm('é')).toBeCloseTo(0.556)
  })

  it('measures regular weight with its own advance widths', () => {
    expect(helveticaEm('')).toBe(0)
    expect(helveticaEm('i')).toBeCloseTo(0.222)
    expect(helveticaEm('Mail')).toBeCloseTo(0.833 + 0.556 + 0.222 + 0.222)
    expect(helveticaEm('Mail')).toBeLessThan(helveticaBoldEm('Mail'))
  })

  it('wraps whole words greedily and says whether they fit', () => {
    const measure = (s: string) => s.length * 10
    expect(wrapWords('aa bb cc', 50, measure)).toEqual(['aa bb', 'cc'])
    expect(wrapWords('  aa   bb ', 50, measure)).toEqual(['aa bb'])
    expect(wrapWords('', 50, measure)).toEqual([])
    expect(fitsInLines('aa bb cc', 50, 2, measure)).toBe(true)
    expect(fitsInLines('aa bb cc', 50, 1, measure)).toBe(false)
    // A single word wider than the line never fits, however many lines are allowed.
    expect(fitsInLines('abcdefgh', 50, 3, measure)).toBe(false)
  })

  it('joins as many whole items as fit on a line', () => {
    const width = (s: string) => helveticaBoldEm(s) * 10.5
    expect(fitJoined(['React', 'TypeScript', 'Tailwind CSS'], 140, 10.5)).toBe('React · TypeScript')
    expect(fitJoined(['Python', 'React', 'Flask'], 140, 10.5)).toBe('Python · React · Flask')
    expect(fitJoined(['Supercalifragilistic Expialidocious'], 140, 10.5)).toBe('Supercalifragilistic Expialidocious')
    expect(fitJoined([], 140, 10.5)).toBe('')
    for (const { stack } of portfolio.projects) {
      const line = fitJoined(stack.slice(0, 3), CARD_TEXT_WIDTH, 10.5)
      expect(width(line)).toBeLessThanOrEqual(CARD_TEXT_WIDTH)
      expect(line.split(' · ')).toEqual(stack.slice(0, line.split(' · ').length))
    }
  })

  it('fits text to a width within the size limits', () => {
    expect(fitFontSize('On', 144, { max: 24, min: 13 })).toBe(24)
    expect(fitFontSize('About This Portfolio', 144, { max: 18, min: 13 })).toBe(14)
    expect(fitFontSize('An extremely long caption that cannot fit', 144, { max: 18, min: 13 })).toBe(13)
    expect(fitFontSize('', 144, { max: 18, min: 13 })).toBe(18)
  })
})

describe('preview keys', () => {
  it('identifies what is shown, not live values', () => {
    expect(previewKey({ type: 'setting', setting: 'sound' })).toBe('setting:sound')
    expect(previewKey({ type: 'project', projectId: 'x' })).toBe('project:x')
    expect(previewKey({ type: 'now-playing' })).toBe('now-playing')
    expect(previewKey(undefined, 'Row')).toBe('none:Row')
  })

  it('distinguishes slideshows and info panels by title', () => {
    const slideshow = (title: string) => previewKey({ type: 'slideshow', artworks: [], title })
    expect(slideshow('Projects')).not.toBe(slideshow('Cover Flow'))
    expect(previewKey({ type: 'info', icon: 'mail', title: 'Email' })).not.toBe(
      previewKey({ type: 'info', icon: 'mail', title: 'Contact' }),
    )
  })
})

describe('generated cover motifs', () => {
  const motifs: ArtworkMotif[] = ['waveform', 'bars', 'grid', 'orbit', 'stripes', 'rings']

  it.each(motifs)('%s is deterministic and non-empty', (motif) => {
    const first = motifShapes(motif)
    expect(first.length).toBeGreaterThan(0)
    expect(motifShapes(motif)).toEqual(first)
  })

  it.each(motifs)('%s keeps to the sleeve with finite, restrained values', (motif) => {
    for (const shape of motifShapes(motif)) {
      expect(shape.opacity).toBeGreaterThan(0)
      expect(shape.opacity).toBeLessThanOrEqual(1)
      const numbers = Object.values(shape).filter((v): v is number => typeof v === 'number')
      for (const n of numbers) expect(Number.isFinite(n)).toBe(true)
      if (shape.kind === 'rect') {
        expect(shape.x).toBeGreaterThanOrEqual(0)
        expect(shape.x + shape.w).toBeLessThanOrEqual(100)
        // Motifs stay above the monogram's cap line.
        expect(shape.y + shape.h).toBeLessThanOrEqual(MONOGRAM.baseline - 36)
      } else {
        expect(shape.cx).toBeGreaterThan(0)
        expect(shape.cx).toBeLessThan(100)
      }
    }
  })

  it('sets monograms as large as fit the sleeve', () => {
    expect(monogramSize('P')).toBe(46)
    expect(monogramSize('CUNY')).toBeLessThan(monogramSize('UP!'))
    for (const text of ['P', 'UP!', 'GF', 'Pb', 'A', 'CUNY', 'QC']) {
      const size = monogramSize(text)
      expect(helveticaBoldEm(text) * size + MONOGRAM.tracking * size * (text.length - 1)).toBeLessThanOrEqual(
        MONOGRAM.width,
      )
    }
  })
})

describe('experience card layout', () => {
  const bold = (size: number) => (s: string) => helveticaBoldEm(s) * size
  const regular11 = (s: string) => helveticaEm(s) * 11

  it.each(portfolio.experience)('fits $menuLabel whole, within the text block', (experience) => {
    const { organization, org, roleLines, summaryLines } = experienceCardLayout(experience)
    expect([experience.organization, experience.menuLabel]).toContain(organization)
    expect(fitsInLines(organization, CARD_TEXT_WIDTH, org.lines, bold(org.size))).toBe(true)
    expect(fitsInLines(experience.role, CARD_TEXT_WIDTH, roleLines, regular11)).toBe(true)
    const height = org.leading * org.lines + 13 * roleLines + 13 + (summaryLines ? 2 + 13 * summaryLines : 0)
    expect(height).toBeLessThanOrEqual(CARD_TEXT_HEIGHT)
  })

  it('prefers the full name on one line, then on two smaller lines, then the menu label', () => {
    const layout = (organization: string, menuLabel = 'Short', role = 'Engineer') =>
      experienceCardLayout({ organization, menuLabel, role })
    expect(layout('Augenta AI')).toMatchObject({ organization: 'Augenta AI', org: { size: 13, lines: 1 } })
    expect(layout('Queens College Computer Science Club')).toMatchObject({
      organization: 'Queens College Computer Science Club',
      org: { size: 12, lines: 2 },
    })
    expect(layout('Office of Student Financial Assistance, CUNY', 'CUNY Financial Aid')).toMatchObject({
      organization: 'CUNY Financial Aid',
      org: { size: 13, lines: 1 },
    })
    // Neither fits: the full name, clamped to two lines, rather than an unrelated label.
    const long = 'An Organisation Name So Long It Cannot Possibly Fit In Two Lines Of Twelve Pixel Type'
    expect(layout(long, 'Also Far Too Long For One Line Or Two Lines Of The Card Text Column At All')).toMatchObject({
      organization: long,
      org: { lines: 2 },
    })
  })

  it('wraps a long role to two lines and gives the summary the whole lines left', () => {
    expect(experienceCardLayout({ organization: 'Puberry', menuLabel: 'Puberry', role: 'Intern' })).toMatchObject({
      roleLines: 1,
      summaryLines: 2,
    })
    const role = 'Financial Aid Technical Assistant'
    expect(experienceCardLayout({ organization: 'CUNY', menuLabel: 'CUNY', role })).toMatchObject({
      roleLines: 2,
      summaryLines: 1,
    })
    const club = experienceCardLayout({
      organization: 'Queens College Computer Science Club',
      menuLabel: 'Leadership',
      role: 'Treasurer / Event Coordinator',
    })
    expect(club).toMatchObject({ roleLines: 2, summaryLines: 0 })
  })
})
