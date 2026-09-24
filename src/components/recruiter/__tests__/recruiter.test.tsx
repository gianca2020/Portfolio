import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { portfolio } from '../../../data/portfolio'
import type { Metric, Portfolio } from '../../../data/types'
import { isUpcoming, shortUrl, toDateTime } from '../format'
import { RecruiterButton } from '../RecruiterButton'
import { RecruiterView } from '../RecruiterView'

describe('format helpers', () => {
  it('converts display dates to <time> values', () => {
    expect(toDateTime('Jun 2026')).toBe('2026-06')
    expect(toDateTime('September 2026')).toBe('2026-09')
    expect(toDateTime(' Dec 2024 ')).toBe('2024-12')
    expect(toDateTime('2027')).toBe('2027')
    expect(toDateTime('Present')).toBeUndefined()
    expect(toDateTime('Smarch 2026')).toBeUndefined()
  })

  it('knows when a date is still ahead', () => {
    const now = new Date(2026, 8, 23)
    expect(isUpcoming('May 2027', now)).toBe(true)
    expect(isUpcoming('Oct 2026', now)).toBe(true)
    expect(isUpcoming('Sep 2026', now)).toBe(false)
    expect(isUpcoming('2026', now)).toBe(true)
    expect(isUpcoming('Present', now)).toBe(false)
  })

  it('shortens URLs for print', () => {
    expect(shortUrl('https://github.com/bryan3342/Polly-AI')).toBe('github.com/bryan3342/Polly-AI')
    expect(shortUrl('https://www.example.com/')).toBe('example.com')
    expect(shortUrl('mailto:me@example.com')).toBe('me@example.com')
  })
})

describe('RecruiterView', () => {
  const html = renderToStaticMarkup(<RecruiterView />)

  it('renders the landmarks and a focusable h1 with the name', () => {
    expect(html).toMatch(/<header[^>]*rv-topbar/)
    expect(html).toContain('<main')
    expect(html).toContain('<footer')
    expect(html).toMatch(new RegExp(`<h1[^>]*tabindex="-1"[^>]*>${portfolio.profile.name}</h1>`))
  })

  it('orders the sections Experience, Projects, Skills, Education, Leadership, About', () => {
    const headings = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1])
    expect(headings).toEqual(['Experience', 'Projects', 'Skills', 'Education', 'Leadership', 'About'])
  })

  // The iPod's LCD can't grow with browser zoom, so this page is its zoomable alternative (WCAG 1.4.4):
  // it must carry everything the device's screens say.
  it('carries all the content of the iPod screens', () => {
    const escapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }
    const text = (value: string) => value.replace(/[&<>"']/g, (c) => escapes[c])
    const metric = ({ value, label }: Metric) => `${text(value)}</span> ${text(label)}`
    const { profile, projects, experience } = portfolio
    for (const paragraph of profile.bio) expect(html).toContain(text(paragraph))
    for (const item of [...profile.focus, ...profile.interests]) expect(html).toContain(text(item))
    for (const project of projects.filter((p) => !p.placeholder)) {
      if (project.role) expect(html).toContain(text(project.role))
      for (const item of project.metrics ?? []) expect(html).toContain(metric(item))
    }
    for (const item of experience.flatMap((e) => e.metrics ?? [])) expect(html).toContain(metric(item))
  })

  it('leaves out empty About content', () => {
    const data: Portfolio = { ...portfolio, profile: { ...portfolio.profile, bio: [], focus: [], interests: [] } }
    expect(renderToStaticMarkup(<RecruiterView data={data} />)).not.toContain('>About</h2>')
  })

  it('offers the résumé download and a way back to the iPod', () => {
    const { href, fileName } = portfolio.resume
    expect(html).toContain(`href="${href}" download="${fileName}"`)
    expect(html).toContain('href="#/"')
  })

  it('keeps full accessible names on the narrow-screen top-bar labels', () => {
    expect(html).toMatch(/<a href="#\/"[^>]*>.*?<span class="max-sm:sr-only">Back to iPod<\/span><\/a>/)
    expect(html).toContain('<span class="max-sm:sr-only">Download résumé</span>')
  })

  it('reads visual separators as commas', () => {
    const { title, location } = portfolio.profile
    const line = new RegExp(`${title}<span class="sr-only">, </span><span aria-hidden="true"[^>]*>·</span>${location}`)
    expect(html).toMatch(line)
  })

  it('prints full contact addresses, not the abbreviated display text', () => {
    for (const link of Object.values(portfolio.contact)) {
      expect(html).toContain(`<span class="hidden print:inline">${shortUrl(link.href)}</span>`)
    }
  })

  it('opens every external link safely in a new tab', () => {
    const blank = [...html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)].map((m) => m[0])
    expect(blank.length).toBeGreaterThan(0)
    for (const tag of blank) expect(tag).toContain('rel="noopener noreferrer"')
  })

  it('hides placeholder projects', () => {
    const [first, ...rest] = portfolio.projects
    const data: Portfolio = {
      ...portfolio,
      projects: [{ ...first, id: 'wip', name: 'Placeholder Project', placeholder: true }, ...rest],
    }
    const markup = renderToStaticMarkup(<RecruiterView data={data} />)
    expect(markup).not.toContain('Placeholder Project')
    for (const project of rest) expect(markup).toContain(project.name)
  })

  it('labels project links the same way the iPod does', () => {
    const [first, ...rest] = portfolio.projects
    const data: Portfolio = {
      ...portfolio,
      projects: [{ ...first, links: { live: 'https://example.dev', demo: 'https://youtu.be/abc' } }, ...rest],
    }
    const markup = renderToStaticMarkup(<RecruiterView data={data} />)
    expect(markup).toContain(`Live Site<span class="sr-only">: ${first.name} (opens in a new tab)</span>`)
    expect(markup).toContain(`Demo<span class="sr-only">: ${first.name} (opens in a new tab)</span>`)
    expect(markup).not.toContain(`Devpost<span class="sr-only">: ${first.name}`)
  })

  it('splits work and leadership experience', () => {
    const leadership = portfolio.experience.filter((e) => e.kind === 'leadership')
    const leadershipAt = html.indexOf('>Leadership</h2>')
    for (const item of leadership) expect(html.indexOf(item.role)).toBeGreaterThan(leadershipAt)
  })
})

describe('RecruiterButton', () => {
  it('links to Recruiter View with a descriptive label', () => {
    const html = renderToStaticMarkup(<RecruiterButton />)
    expect(html).toContain('href="#/recruiter"')
    expect(html).toContain('aria-label="Recruiter View — simple one-page résumé"')
    expect(html).toContain('<span class="recruiter-button__label">Recruiter View</span></a>')
  })
})
