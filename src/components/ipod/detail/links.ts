import type { ProjectLinks } from '../../../data/types'

/*
 * Project link labels, shared by the iPod detail screens and Recruiter View so
 * both always call the same link the same thing.
 */

export interface ProjectLink {
  key: keyof ProjectLinks
  label: string
  href: string
}

const isDevpost = (href: string) => {
  try {
    return /(^|\.)devpost\.com$/i.test(new URL(href).hostname)
  } catch {
    return false
  }
}

/** A project's links in display order (GitHub, Live Site, then Devpost or Demo), skipping missing ones. */
export function projectLinkList(links: ProjectLinks): ProjectLink[] {
  const list: ProjectLink[] = []
  if (links.github) list.push({ key: 'github', label: 'GitHub', href: links.github })
  if (links.live) list.push({ key: 'live', label: 'Live Site', href: links.live })
  // `demo` can be a Devpost page, a video or a write-up: only name the host when it really is Devpost.
  if (links.demo) list.push({ key: 'demo', label: isDevpost(links.demo) ? 'Devpost' : 'Demo', href: links.demo })
  return list
}
