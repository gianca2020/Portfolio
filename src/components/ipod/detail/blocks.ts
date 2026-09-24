import type { ContactLink, Experience, Portfolio, Project } from '../../../data/types'
import { projectLinkList } from './links'
import type { ActionBlock, DetailBlock } from './types'

/*
 * Content → DetailBlock[] mappers for every detail screen. Pure, so the screens
 * stay declarative and the mapping is unit-tested without a DOM.
 */

const heading = (text: string): DetailBlock => ({ type: 'heading', text })

/** Short label for a link row's right side: "owner/repo" on GitHub, else the host. */
export function linkDetail(href: string): string {
  try {
    const url = new URL(href)
    const host = url.hostname.replace(/^www\./, '')
    const path = url.pathname.replace(/^\/|\/$/g, '')
    return host === 'github.com' && path ? path : host
  } catch {
    return href
  }
}

function openUrl(label: string, icon: ActionBlock['icon'], href: string, detail = linkDetail(href)): ActionBlock {
  return { type: 'action', label, icon, detail, action: { type: 'open-url', href } }
}

const contactAction = (link: ContactLink, icon: ActionBlock['icon']) => openUrl(link.label, icon, link.href, link.display)

export function notFoundBlocks(what: string): DetailBlock[] {
  return [heading('Not Found'), { type: 'text', text: `This ${what} isn’t in the library. Press MENU to go back.` }]
}

export function projectBlocks(project: Project | undefined): DetailBlock[] {
  if (!project) return notFoundBlocks('project')
  const blocks: DetailBlock[] = [
    { type: 'hero', artwork: project.artwork, title: project.name, subtitle: project.tagline, meta: project.date },
    { type: 'text', text: project.description },
  ]
  if (project.role) blocks.push({ type: 'text', tone: 'caption', text: `My role: ${project.role}` })
  if (project.metrics?.length) blocks.push({ type: 'metrics', items: project.metrics.slice(0, 3) })
  if (project.stack.length) blocks.push(heading('Tech Stack'), { type: 'tags', items: project.stack })
  if (project.highlights.length) {
    blocks.push(heading('Highlights'), { type: 'bullets', items: project.highlights.slice(0, 4) })
  }
  for (const { key, label, href } of projectLinkList(project.links)) {
    blocks.push(openUrl(label, key === 'github' ? 'github' : 'external', href))
  }
  return blocks
}

export const dateRange = (e: Pick<Experience, 'start' | 'end'>) => `${e.start} – ${e.end}`

export function experienceBlocks(experience: Experience | undefined): DetailBlock[] {
  if (!experience) return notFoundBlocks('role')
  const blocks: DetailBlock[] = [
    {
      type: 'hero',
      artwork: experience.artwork,
      title: experience.role,
      subtitle: experience.organization,
      meta: `${dateRange(experience)} · ${experience.location}`,
    },
  ]
  if (experience.metrics?.length) blocks.push({ type: 'metrics', items: experience.metrics.slice(0, 3) })
  if (experience.highlights.length) {
    blocks.push(heading('Highlights'), { type: 'bullets', items: experience.highlights })
  }
  if (experience.stack?.length) blocks.push(heading('Stack'), { type: 'tags', items: experience.stack })
  return blocks
}

const educationRows = ({ profile }: Portfolio) => [
  { key: 'School', value: profile.education.school },
  { key: 'Degree', value: profile.education.degree },
  { key: 'Graduation', value: profile.education.graduation },
]

const downloadResume = ({ resume }: Portfolio): ActionBlock => ({
  type: 'action',
  label: 'Download Resume',
  icon: 'download',
  detail: 'PDF',
  action: { type: 'download', href: resume.href, fileName: resume.fileName },
})

export function aboutBlocks(content: Portfolio): DetailBlock[] {
  const { profile, skills, contact } = content
  return [
    {
      type: 'hero',
      photo: { src: profile.photo, initials: profile.initials },
      title: profile.name,
      subtitle: profile.title,
      meta: profile.location,
    },
    ...profile.bio.map<DetailBlock>((text) => ({ type: 'text', text })),
    heading('Focus'),
    { type: 'tags', items: profile.focus },
    heading('Interests'),
    { type: 'bullets', items: profile.interests },
    heading('Skills'),
    ...skills.map<DetailBlock>((group) => ({ type: 'tags', label: group.name, items: group.items })),
    heading('Education'),
    { type: 'kv', rows: [...educationRows(content), { key: 'Location', value: profile.education.location }] },
    contactAction(contact.email, 'mail'),
    contactAction(contact.github, 'github'),
    contactAction(contact.linkedin, 'linkedin'),
    downloadResume(content),
  ]
}

/** Skill items per group on the condensed résumé. */
const RESUME_SKILLS_PER_GROUP = 4

export function resumeBlocks(content: Portfolio): DetailBlock[] {
  const { profile, experience, projects, skills, resume } = content
  return [
    { type: 'hero', document: true, title: profile.name, subtitle: profile.title, meta: `Updated ${resume.updated}` },
    { type: 'text', text: profile.headline },
    heading('Experience'),
    ...experience.map<DetailBlock>((e) => ({
      type: 'entry',
      title: `${e.role} — ${e.organization}`,
      meta: dateRange(e),
      text: e.summary,
    })),
    heading('Projects'),
    ...projects
      .filter((p) => !p.placeholder)
      .map<DetailBlock>((p) => ({ type: 'entry', title: p.name, meta: p.date, text: p.tagline })),
    heading('Skills'),
    ...skills.map<DetailBlock>((group) => ({
      type: 'tags',
      label: group.name,
      items: group.items.slice(0, RESUME_SKILLS_PER_GROUP),
    })),
    heading('Education'),
    { type: 'kv', rows: educationRows(content) },
    // No detail: the ↗ already says "new tab" (and a relative PDF path has no host to show).
    { type: 'action', label: 'Open PDF', icon: 'document', action: { type: 'open-url', href: resume.href } },
    downloadResume(content),
    { type: 'action', label: 'Recruiter View', icon: 'recruiter', action: { type: 'recruiter-view' } },
  ]
}

export const skillCount = (content: Portfolio) => content.skills.reduce((sum, group) => sum + group.items.length, 0)

/** Settings › About This Portfolio. The "View Source" row needs `content.sourceUrl`. */
export function aboutPortfolioBlocks(content: Portfolio): DetailBlock[] {
  const { profile, projects, experience, resume, sourceUrl } = content
  const blocks: DetailBlock[] = [
    {
      type: 'kv',
      rows: [
        { key: 'Name', value: `${profile.shortName}’s Portfolio` },
        { key: 'Projects', value: String(projects.length) },
        { key: 'Roles', value: String(experience.length) },
        { key: 'Skills', value: String(skillCount(content)) },
        { key: 'Version', value: '1.0' },
        { key: 'Updated', value: resume.updated },
        { key: 'Built With', value: 'React · TypeScript' },
        { key: 'Styling', value: 'Tailwind CSS' },
        { key: 'Motion', value: 'Framer Motion' },
        { key: 'Audio', value: 'Web Audio (synthesized)' },
      ],
    },
    heading('Controls'),
    {
      type: 'bullets',
      items: [
        'Rotate the wheel or use ↑ ↓',
        'Select / Enter / → opens',
        'MENU / Esc / ← goes back',
        '▶︎❚❚ or Space plays the Now Building easter egg',
      ],
    },
    {
      type: 'text',
      tone: 'caption',
      text: 'An homage to the iPod classic (6th generation). Not affiliated with Apple.',
    },
  ]
  if (sourceUrl) blocks.push(openUrl('View Source', 'github', sourceUrl))
  return blocks
}
