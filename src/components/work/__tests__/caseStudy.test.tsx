import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { asset, caseStudies, hasText, publishedCaseStudies, type CaseStudy as CaseStudyData } from '../../../content/work'
import { codeForAll } from '../../../content/work/code-for-all'
import { CaseStudy } from '../CaseStudy'

const render = (study: CaseStudyData) => renderToStaticMarkup(<CaseStudy study={study} />)
const headings = (html: string) => [...html.matchAll(/<h2[^>]*>([^<]*)<\/h2>/g)].map((m) => m[1])

/** A study where every field is a placeholder or points at a file that doesn't exist. */
const placeholder: CaseStudyData = {
  slug: 'code-for-all',
  published: true,
  title: 'Placeholder',
  summary: 'TODO',
  cover: { type: 'image', src: 'missing.webp', alt: 'nope' },
  snapshot: { role: 'TODO', team: '', timeline: '  ', tools: ['TODO'], platforms: [], metrics: [{ value: 'TODO', label: 'x' }] },
  problem: 'todo',
  users: [{ name: 'TODO', description: 'TODO' }],
  decisions: [{ title: 'TODO', why: 'TODO' }, { title: 'Media only, missing', why: '', media: { type: 'video', src: 'missing.mp4', alt: '' } }],
  process: [{ label: 'Sketch', src: 'missing.webp', alt: '' }],
  finalDesign: { text: 'TODO', media: [{ type: 'image', src: 'missing.webp', alt: '' }] },
  links: [{ label: 'TODO', href: '' }],
  outcome: 'TODO',
  reflection: '',
}

describe('skip rules', () => {
  it('treats TODO, empty and blank strings as missing', () => {
    expect(['TODO', 'todo', '', '   ', undefined].map(hasText)).toEqual([false, false, false, false, false])
    expect(hasText('Designer')).toBe(true)
  })

  it('only resolves media the asset script has published', () => {
    expect(asset('code-for-all', 'cover.webp')).toMatchObject({ url: '/work/code-for-all/cover.webp', width: 2000 })
    expect(asset('code-for-all', 'missing.webp')).toBeUndefined()
  })

  it('renders only the title when everything else is a placeholder', () => {
    const html = render(placeholder)
    expect(headings(html)).toEqual([])
    expect(html).not.toMatch(/TODO|<img|<video|<figure/i)
    expect(html).toContain('Placeholder')
  })

  it('never shows placeholder text in a published case study', () => {
    for (const study of publishedCaseStudies) expect(render(study)).not.toMatch(/TODO/i)
  })

  it('every media file referenced by a published case study exists', () => {
    for (const study of publishedCaseStudies) {
      const srcs = [
        study.cover?.src,
        ...study.decisions.map((d) => d.media?.src),
        ...study.process.map((p) => p.src),
        ...study.finalDesign.media.map((m) => m.src),
      ].filter(hasText)
      expect(srcs.filter((src) => !asset(study.slug, src))).toEqual([])
    }
  })
})

describe('Code For All', () => {
  const html = render(codeForAll)

  it('is published and listed', () => {
    expect(publishedCaseStudies.map((c) => c.slug)).toContain('code-for-all')
    expect(caseStudies.find((c) => c.slug === 'hackknight')?.published).toBe(false)
  })

  it('renders its filled sections in order and skips the TODO ones', () => {
    expect(headings(html)).toEqual(['Snapshot', 'The problem', 'Who it’s for', 'Key decisions', 'Process', 'Final design'])
  })

  it('has one h1 and numbered decisions with sized, lazy, described images', () => {
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html.match(/<h3 class="work-decision__title"/g)).toHaveLength(codeForAll.decisions.length)
    for (const img of html.match(/<img [^>]*>/g) ?? []) {
      expect(img).toMatch(/width="\d+"/)
      expect(img).toMatch(/height="\d+"/)
      expect(img).toMatch(/alt="[^"]+"/)
    }
    expect(html.match(/loading="eager"/g)).toHaveLength(1) // the hero cover only
  })
})
