import { portfolio } from '../../data/portfolio'
import type { Portfolio } from '../../data/types'
import type { IPodNode, MenuNode, NavigableNode } from './types'

/** Stable node ids for content screens (use these instead of formatting ids by hand). */
export const projectNodeId = (projectId: string) => `projects/${projectId}`
export const experienceNodeId = (experienceId: string) => `experience/${experienceId}`

/** Slideshow caption for a list: "1 project", "4 projects", "No projects yet". */
const countCaption = (n: number, one: string, many = `${one}s`) =>
  n === 0 ? `No ${many} yet` : `${n} ${n === 1 ? one : many}`

/**
 * Builds the iPod menu tree from portfolio content.
 *
 * Giancarlo
 * ├── Projects ─ one row per project + View All Projects (Cover Flow)
 * ├── Experience ─ one row per role
 * ├── About Me
 * ├── Resume ─ View Resume · Download Resume · Recruiter View
 * ├── Contact ─ GitHub · LinkedIn · Email · Download Resume
 * ├── Settings ─ Sound · Theme · Reduce Motion · About This Portfolio
 * └── Now Playing (only after Play/Pause has been pressed)
 */
export function buildMenuTree(content: Portfolio): MenuNode {
  const { profile, projects, experience, contact, resume } = content

  const downloadResume = (id: string): IPodNode => ({
    kind: 'action',
    id,
    label: 'Download Resume',
    action: { type: 'download', href: resume.href, fileName: resume.fileName },
    preview: { type: 'info', icon: 'download', title: 'Download Resume', detail: `PDF · updated ${resume.updated}` },
  })

  const projectsMenu: MenuNode = {
    kind: 'menu',
    id: 'projects',
    label: 'Projects',
    title: 'Projects',
    layout: 'split',
    preview: {
      type: 'slideshow',
      artworks: projects.map((p) => p.artwork),
      title: 'Projects',
      caption: countCaption(projects.length, 'project'),
    },
    children: [
      ...projects.map<IPodNode>((p) => ({
        kind: 'screen',
        id: projectNodeId(p.id),
        label: p.name,
        title: p.name,
        screen: { type: 'project', projectId: p.id },
        preview: { type: 'project', projectId: p.id },
      })),
      {
        kind: 'screen',
        id: 'projects/all',
        label: 'View All Projects',
        title: 'Cover Flow',
        screen: { type: 'cover-flow' },
        preview: {
          type: 'slideshow',
          artworks: projects.map((p) => p.artwork),
          title: 'Cover Flow',
          caption: 'Browse every project',
        },
      },
    ],
  }

  const experienceMenu: MenuNode = {
    kind: 'menu',
    id: 'experience',
    label: 'Experience',
    title: 'Experience',
    layout: 'split',
    preview: {
      type: 'slideshow',
      artworks: experience.map((e) => e.artwork),
      title: 'Experience',
      caption: countCaption(experience.length, 'role'),
    },
    children: experience.map<IPodNode>((e) => ({
      kind: 'screen',
      id: experienceNodeId(e.id),
      label: e.menuLabel,
      title: e.menuLabel,
      screen: { type: 'experience', experienceId: e.id },
      preview: { type: 'experience', experienceId: e.id },
    })),
  }

  const resumeMenu: MenuNode = {
    kind: 'menu',
    id: 'resume',
    label: 'Resume',
    title: 'Resume',
    layout: 'split',
    preview: { type: 'info', icon: 'document', title: 'Resume', detail: `Updated ${resume.updated}` },
    children: [
      {
        kind: 'screen',
        id: 'resume/view',
        label: 'View Resume',
        title: 'Resume',
        screen: { type: 'resume' },
        preview: { type: 'info', icon: 'document', title: 'View Resume', detail: 'Read it right here, one screen at a time.' },
      },
      downloadResume('resume/download'),
      // Recruiter View is temporarily disabled (see App.tsx). To restore, uncomment.
      // {
      //   kind: 'action',
      //   id: 'resume/recruiter',
      //   label: 'Recruiter View',
      //   action: { type: 'recruiter-view' },
      //   preview: {
      //     type: 'info',
      //     icon: 'recruiter',
      //     title: 'Recruiter View',
      //     detail: 'A clean one-page overview. No click wheel required.',
      //   },
      // },
    ],
  }

  const contactMenu: MenuNode = {
    kind: 'menu',
    id: 'contact',
    label: 'Contact',
    title: 'Contact',
    layout: 'split',
    preview: { type: 'info', icon: 'mail', title: 'Contact', detail: contact.email.display },
    children: [
      {
        kind: 'action',
        id: 'contact/github',
        label: contact.github.label,
        action: { type: 'open-url', href: contact.github.href },
        preview: { type: 'info', icon: 'github', title: contact.github.label, detail: contact.github.display, hint: 'Opens in a new tab' },
      },
      {
        kind: 'action',
        id: 'contact/linkedin',
        label: contact.linkedin.label,
        action: { type: 'open-url', href: contact.linkedin.href },
        preview: { type: 'info', icon: 'linkedin', title: contact.linkedin.label, detail: contact.linkedin.display, hint: 'Opens in a new tab' },
      },
      {
        kind: 'action',
        id: 'contact/email',
        label: contact.email.label,
        action: { type: 'open-url', href: contact.email.href },
        preview: { type: 'info', icon: 'mail', title: contact.email.label, detail: contact.email.display, hint: 'Opens your mail app' },
      },
      downloadResume('contact/resume'),
    ],
  }

  const settingsMenu: MenuNode = {
    kind: 'menu',
    id: 'settings',
    label: 'Settings',
    title: 'Settings',
    layout: 'split',
    preview: { type: 'info', icon: 'settings', title: 'Settings', detail: 'Sound, theme and motion.' },
    children: [
      { kind: 'setting', id: 'settings/sound', label: 'Sound', setting: 'sound', preview: { type: 'setting', setting: 'sound' } },
      { kind: 'setting', id: 'settings/theme', label: 'Theme', setting: 'theme', preview: { type: 'setting', setting: 'theme' } },
      {
        kind: 'setting',
        id: 'settings/reduce-motion',
        label: 'Reduce Motion',
        setting: 'reduceMotion',
        preview: { type: 'setting', setting: 'reduceMotion' },
      },
      {
        kind: 'screen',
        id: 'settings/about',
        label: 'About This Portfolio',
        title: 'About',
        screen: { type: 'about-portfolio' },
        preview: { type: 'info', icon: 'info', title: 'About This Portfolio' },
      },
    ],
  }

  return {
    kind: 'menu',
    id: 'root',
    label: profile.shortName,
    title: profile.shortName,
    layout: 'split',
    children: [
      projectsMenu,
      experienceMenu,
      {
        kind: 'screen',
        id: 'about',
        label: 'About Me',
        title: 'About Me',
        screen: { type: 'about' },
        preview: { type: 'profile' },
      },
      resumeMenu,
      contactMenu,
      settingsMenu,
      {
        kind: 'screen',
        id: 'now-playing',
        label: 'Now Playing',
        title: 'Now Playing',
        screen: { type: 'now-playing' },
        preview: { type: 'now-playing' },
        visibleWhen: 'playing',
      },
    ],
  }
}

/** Flattens the tree into an id → node lookup. Throws on duplicate ids. */
export function indexTree(root: MenuNode): Map<string, IPodNode> {
  const map = new Map<string, IPodNode>()
  const visit = (node: IPodNode) => {
    if (map.has(node.id)) throw new Error(`Duplicate iPod node id "${node.id}"`)
    map.set(node.id, node)
    if (node.kind === 'menu') node.children.forEach(visit)
  }
  visit(root)
  return map
}

/** Rows a menu currently lists (hides "Now Playing" until playback has started). */
export function getVisibleChildren(menu: MenuNode, playbackStarted: boolean): IPodNode[] {
  return menu.children.filter((child) => child.visibleWhen !== 'playing' || playbackStarted)
}

export const isNavigable = (node: IPodNode | undefined): node is NavigableNode =>
  node?.kind === 'menu' || node?.kind === 'screen'

/** Whether a row opens another screen (and therefore shows a › chevron). */
export const opensScreen = (node: IPodNode) => node.kind === 'menu' || node.kind === 'screen'

export const menuTree = buildMenuTree(portfolio)
export const nodeIndex = indexTree(menuTree)
