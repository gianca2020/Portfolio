/**
 * Content model for the portfolio.
 *
 * Everything a visitor can read — in the iPod interface or in Recruiter View —
 * is described by these types and lives in `portfolio.ts`. Rendering code never
 * hardcodes portfolio copy; add a project or a role there and both interfaces
 * pick it up automatically.
 */

/** Motifs the generated cover-art renderer knows how to draw. */
export type ArtworkMotif = 'waveform' | 'bars' | 'grid' | 'orbit' | 'stripes' | 'rings'

/**
 * Album-style artwork for a project, role or track.
 *
 * Until real screenshots exist, covers are generated from a palette, monogram
 * and motif. Set `image` (a path under /public or a URL) to show a screenshot
 * instead — nothing else needs to change.
 */
export interface ArtworkSpec {
  /** Optional screenshot / photo. When present it replaces the generated cover. */
  image?: string
  /** Alt text for `image` (generated covers are decorative). */
  imageAlt?: string
  /** 1–4 characters drawn large on the generated cover, e.g. "P" or "UP!". */
  monogram: string
  /** Generated cover palette as hex colours: [background, foreground, accent]. */
  palette: [string, string, string]
  motif: ArtworkMotif
}

export interface Metric {
  /** The headline number, e.g. "30+ FPS". Keep it short. */
  value: string
  /** What the number measures, e.g. "live frame analysis". */
  label: string
}

export interface ProjectLinks {
  github?: string
  live?: string
  /** Devpost / video demo / write-up. */
  demo?: string
}

export interface Project {
  /** URL-safe slug; also the stable id used by the navigation engine. */
  id: string
  name: string
  /** One line for the split-view preview. */
  tagline: string
  /** One or two sentences for the detail screen. */
  description: string
  /** Display date, e.g. "Oct 2025". */
  date: string
  /** Your role on the project, e.g. "Front end + streaming back end". */
  role?: string
  /** Full stack. The first three entries are treated as the primary stack in previews. */
  stack: string[]
  /** 2–4 strongest accomplishments or features. */
  highlights: string[]
  metrics?: Metric[]
  links: ProjectLinks
  artwork: ArtworkSpec
  /**
   * Marks a slot that still holds placeholder copy. Recruiter View hides
   * placeholder projects; the iPod shows them so the layout can be previewed.
   */
  placeholder?: boolean
}

export type ExperienceKind = 'work' | 'leadership'

export interface Experience {
  /** URL-safe slug; stable id for navigation. */
  id: string
  /** Full organisation name. */
  organization: string
  /** Short label for iPod menus, e.g. "CUNY Financial Aid". */
  menuLabel: string
  role: string
  location: string
  /** Display dates, e.g. "Jun 2026". */
  start: string
  end: string
  kind: ExperienceKind
  /** One abbreviated accomplishment for the split-view preview. */
  summary: string
  /** Richer bullets for the detail screen and Recruiter View. */
  highlights: string[]
  stack?: string[]
  metrics?: Metric[]
  artwork: ArtworkSpec
}

export interface SkillGroup {
  name: string
  items: string[]
}

export interface Education {
  school: string
  degree: string
  location: string
  graduation: string
}

export interface Profile {
  name: string
  /** Shown as the iPod's root menu title. */
  shortName: string
  title: string
  location: string
  /** One sentence positioning statement. */
  headline: string
  /** Short bio paragraphs (keep to 2–3 short paragraphs). */
  bio: string[]
  /** Areas of focus, e.g. "Full-stack development". */
  focus: string[]
  interests: string[]
  /** Path under /public or URL. When absent a monogram placeholder is shown. */
  photo?: string
  initials: string
  education: Education
  /** Short availability line for Recruiter View, e.g. "Open to 2027 new-grad roles". */
  availability?: string
}

export interface ContactLink {
  label: string
  /** What is shown to the user, e.g. "github.com/gianca2020". */
  display: string
  href: string
}

export interface ContactInfo {
  email: ContactLink
  github: ContactLink
  linkedin: ContactLink
}

export interface ResumeFile {
  /** Public URL of the PDF. */
  href: string
  /** Suggested filename for downloads. */
  fileName: string
  /** Display date of this version, e.g. "Sep 2026". */
  updated: string
}

/** A "song" for the Now Playing easter egg (Play/Pause on the click wheel). */
export interface Track {
  id: string
  title: string
  artist: string
  album: string
  /** Seconds. */
  duration: number
  artwork: ArtworkSpec
}

export interface Portfolio {
  profile: Profile
  projects: Project[]
  experience: Experience[]
  skills: SkillGroup[]
  contact: ContactInfo
  resume: ResumeFile
  nowBuilding: Track[]
  /** This site's own source repository (Settings › About This Portfolio › View Source; hidden when absent). */
  sourceUrl?: string
}
