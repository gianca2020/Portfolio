import manifest from './assets.manifest.json'
import { gallery } from './gallery'
import { publishedCaseStudies } from './registry'

export type * from './types'
export { caseStudies, publishedCaseStudies } from './registry'
export { gallery }

export const findCaseStudy = (slug: string | undefined) => publishedCaseStudies.find((c) => c.slug === slug)

/** Whether /work has anything beyond the case studies, i.e. whether to show “More Design Work”. */
export const hasGallery = gallery.length > 0

/* ── Skip rules ─────────────────────────────────────────────────────────── */

/** A field is shown only when it holds real copy: not empty, not 'TODO'. */
export const hasText = (value: string | undefined): value is string =>
  value !== undefined && value.trim() !== '' && value.trim().toUpperCase() !== 'TODO'

/** Non-placeholder strings of a list. */
export const texts = (values: string[]) => values.filter(hasText)

export interface AssetInfo {
  url: string
  width: number
  height: number
}

const assets: Record<string, { width: number; height: number }> = manifest

/**
 * A published media file, or undefined when the asset script hasn't produced
 * it. Only files in the manifest render, so a missing image never shows as a
 * broken icon.
 */
export function asset(folder: string, src: string | undefined): AssetInfo | undefined {
  if (!hasText(src)) return undefined
  const size = assets[`${folder}/${src}`]
  return size && { url: `${import.meta.env.BASE_URL}work/${folder}/${src}`, ...size }
}

/** Poster frame the asset script writes next to each video. */
export const posterFor = (videoSrc: string) => videoSrc.replace(/\.[a-z0-9]+$/i, '-poster.webp')

/** Paragraphs of a multi-paragraph field (blank lines separate them). */
export const paragraphs = (value: string) =>
  value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
