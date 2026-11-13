/**
 * Content model for the design case studies at /work/:slug.
 *
 * Any string may be left as 'TODO' (or empty) and any list empty while copy is
 * still being written: the page skips those fields, and drops a section that
 * ends up with nothing in it. Media `src` is a file name inside
 * public/work/<slug>/; files missing from assets.manifest.json are skipped too
 * (run `npm run work:assets` after adding originals to portfolio-assets/).
 */

export interface ImageMedia {
  type: 'image'
  src: string
  alt: string
}

export interface VideoMedia {
  type: 'video'
  /** An .mp4 built by the asset script; its poster is <name>-poster.webp. */
  src: string
  /** Read to screen readers as the video's label. */
  alt: string
}

export type Media = ImageMedia | VideoMedia

export interface CaseMetric {
  /** The headline number, e.g. "20". */
  value: string
  /** What it counts, e.g. "Cody variations". */
  label: string
}

export interface CaseUser {
  name: string
  description: string
}

export interface KeyDecision {
  title: string
  /** Why this was the right call. Blank lines separate paragraphs. */
  why: string
  media?: Media
  caption?: string
}

export interface ProcessStep {
  label: string
  src: string
  alt: string
}

export interface CaseLink {
  label: string
  href: string
}

export interface CaseStudy {
  /** URL segment: /work/<slug>. Also the folder name under public/work/. */
  slug: string
  /** Only published case studies are routed, listed on the iPod and in /work. */
  published: boolean
  title: string
  /** One or two sentences: the hero subtitle, meta description and card blurb. */
  summary: string
  cover?: ImageMedia
  snapshot: {
    role: string
    team: string
    timeline: string
    tools: string[]
    platforms: string[]
    metrics: CaseMetric[]
  }
  problem: string
  users: CaseUser[]
  decisions: KeyDecision[]
  process: ProcessStep[]
  finalDesign: {
    text: string
    media: Media[]
  }
  links: CaseLink[]
  outcome: string
  reflection: string
}

/** A one-off piece for the /work gallery (posters, social graphics…). */
export interface GalleryItem {
  title: string
  role: string
  description: string
  /** One image per format when `formats` is set (same order); otherwise a set of images. */
  images: Array<{ src: string; alt: string }>
  /** e.g. ['Print poster', 'Instagram post', 'Instagram story']. */
  formats?: string[]
  link?: CaseLink
}
