import { describe, expect, it } from 'vitest'
import { findExperience, findProject, portfolio } from '../../../data/portfolio'
import { actionHint, describeActionRow } from '../detail/actions'
import {
  aboutBlocks,
  aboutPortfolioBlocks,
  experienceBlocks,
  linkDetail,
  projectBlocks,
  resumeBlocks,
  skillCount,
} from '../detail/blocks'
import { projectLinkList } from '../detail/links'
import type { ActionBlock, DetailBlock } from '../detail/types'

const actions = (blocks: DetailBlock[]) => blocks.filter((b): b is ActionBlock => b.type === 'action')
const types = (blocks: DetailBlock[]) => blocks.map((b) => b.type)
const headings = (blocks: DetailBlock[]) => blocks.flatMap((b) => (b.type === 'heading' ? [b.text] : []))

describe('projectBlocks', () => {
  const polly = findProject('polly-debate-ai')

  it('lays out the flagship project page in order', () => {
    const blocks = projectBlocks(polly)
    expect(blocks[0]).toMatchObject({ type: 'hero', title: 'Polly Debate AI', meta: 'Oct 2025' })
    expect(types(blocks).slice(1, 4)).toEqual(['text', 'text', 'metrics'])
    expect(headings(blocks)).toEqual(['Tech Stack', 'Highlights'])
  })

  it('adds one action per available link', () => {
    expect(actions(projectBlocks(polly)).map((a) => [a.label, a.icon])).toEqual([
      ['GitHub', 'github'],
      ['Live Site', 'external'],
      ['Devpost', 'external'],
    ])
    expect(actions(projectBlocks(findProject('ipod-portfolio'))).map((a) => a.label)).toEqual(['GitHub'])
  })

  it('calls a demo that is not on Devpost "Demo"', () => {
    const video = { ...polly!, links: { demo: 'https://youtu.be/abc' } }
    expect(actions(projectBlocks(video)).map((a) => [a.label, a.icon])).toEqual([['Demo', 'external']])
  })

  it('caps highlights at four', () => {
    const many = { ...polly!, highlights: ['a', 'b', 'c', 'd', 'e'] }
    const bullets = projectBlocks(many).find((b) => b.type === 'bullets')
    expect(bullets).toMatchObject({ items: ['a', 'b', 'c', 'd'] })
  })

  it('degrades to a Not Found notice for an unknown id', () => {
    const blocks = projectBlocks(findProject('nope'))
    expect(headings(blocks)).toEqual(['Not Found'])
    expect(actions(blocks)).toHaveLength(0)
  })
})

describe('experienceBlocks', () => {
  it('shows role, organization, dates and location in the hero', () => {
    const blocks = experienceBlocks(findExperience('augenta-ai'))
    expect(blocks[0]).toMatchObject({
      type: 'hero',
      title: 'Forward Deployed Engineer',
      subtitle: 'Augenta AI',
      meta: 'Mar 2026 – Jun 2026 · New York, NY',
    })
    expect(headings(blocks)).toEqual(['Highlights', 'Stack'])
  })

  it('omits the stack section when a role has none', () => {
    expect(headings(experienceBlocks(findExperience('puberry')))).toEqual(['Highlights'])
  })
})

describe('screen blocks', () => {
  it('About Me ends with contact and résumé actions', () => {
    const blocks = aboutBlocks(portfolio)
    expect(actions(blocks).map((a) => a.label)).toEqual(['Email', 'GitHub', 'LinkedIn', 'Download Resume'])
    expect(headings(blocks)).toEqual(['Focus', 'Interests', 'Skills', 'Education'])
    const groups = blocks.flatMap((b) => (b.type === 'tags' && b.label ? [b.label] : []))
    expect(groups).toEqual(portfolio.skills.map((g) => g.name))
  })

  it('Resume lists every role and offers PDF, download and Recruiter View', () => {
    const blocks = resumeBlocks(portfolio)
    expect(blocks.filter((b) => b.type === 'entry')).toHaveLength(
      portfolio.experience.length + portfolio.projects.filter((p) => !p.placeholder).length,
    )
    expect(actions(blocks).map((a) => a.action.type)).toEqual(['open-url', 'download', 'recruiter-view'])
    const openPdf = actions(blocks)[0]
    expect(openPdf).toMatchObject({ label: 'Open PDF', action: { href: portfolio.resume.href } })
    expect(openPdf.detail).toBeUndefined()
  })

  it('About This Portfolio counts content and links to the source', () => {
    const sourceUrl = 'https://github.com/gianca2020/Portfolio'
    const blocks = aboutPortfolioBlocks({ ...portfolio, sourceUrl })
    const kv = blocks.find((b) => b.type === 'kv')
    const rows = kv?.type === 'kv' ? Object.fromEntries(kv.rows.map((r) => [r.key, r.value])) : {}
    expect(rows).toMatchObject({
      Projects: String(portfolio.projects.length),
      Roles: String(portfolio.experience.length),
      Skills: String(skillCount(portfolio)),
      Version: '1.0',
    })
    expect(actions(blocks)).toEqual([
      expect.objectContaining({ label: 'View Source', action: { type: 'open-url', href: sourceUrl } }),
    ])
  })

  it('About This Portfolio leaves View Source out without a source URL', () => {
    expect(actions(aboutPortfolioBlocks({ ...portfolio, sourceUrl: undefined }))).toEqual([])
  })

  it('takes View Source from the content, whatever the projects are', () => {
    expect(portfolio.sourceUrl).toMatch(/^https:\/\//)
    const withoutSiteProject = { ...portfolio, projects: portfolio.projects.filter((p) => p.id !== 'ipod-portfolio') }
    expect(actions(aboutPortfolioBlocks(withoutSiteProject))).toEqual([
      expect.objectContaining({ label: 'View Source', action: { type: 'open-url', href: portfolio.sourceUrl } }),
    ])
  })
})

describe('projectLinkList', () => {
  it('lists GitHub, Live Site and the demo in that order, skipping missing links', () => {
    const links = projectLinkList({
      demo: 'https://devpost.com/software/x',
      github: 'https://github.com/a/b',
      live: 'https://x.dev',
    })
    expect(links.map((l) => [l.key, l.label])).toEqual([
      ['github', 'GitHub'],
      ['live', 'Live Site'],
      ['demo', 'Devpost'],
    ])
    expect(projectLinkList({ live: 'https://x.dev' })).toEqual([
      { key: 'live', label: 'Live Site', href: 'https://x.dev' },
    ])
  })

  it('only says Devpost when the demo is hosted there', () => {
    const label = (demo: string) => projectLinkList({ demo })[0].label
    expect(label('https://www.devpost.com/software/x')).toBe('Devpost')
    expect(label('https://youtu.be/abc')).toBe('Demo')
    expect(label('https://blog.example/post?via=devpost.com')).toBe('Demo')
    expect(label('not a url')).toBe('Demo')
  })
})

describe('action row speech', () => {
  const rows = actions(aboutBlocks(portfolio))

  it('says where a row leads when it leaves the iPod', () => {
    expect(actionHint({ type: 'open-url', href: 'https://github.com/a' })).toBe('opens in a new tab')
    expect(actionHint({ type: 'open-url', href: 'mailto:me@example.com' })).toBe('opens your mail app')
    expect(actionHint({ type: 'recruiter-view' })).toBeUndefined()
  })

  it('describes the highlighted row with its position', () => {
    expect(describeActionRow(rows, 1)).toBe('GitHub, opens in a new tab, 2 of 4')
    expect(describeActionRow(rows, 3)).toBe('Download Resume, 4 of 4')
  })

  it('has nothing to add for a reading position', () => {
    expect(describeActionRow(rows, -1)).toBeUndefined()
    expect(describeActionRow(rows, 4)).toBeUndefined()
  })
})

describe('linkDetail', () => {
  it('shows owner/repo for GitHub and the bare host elsewhere', () => {
    expect(linkDetail('https://github.com/bryan3342/Polly-AI')).toBe('bryan3342/Polly-AI')
    expect(linkDetail('https://www.devpost.com/software/polly-ai')).toBe('devpost.com')
    expect(linkDetail('not a url')).toBe('not a url')
  })
})
