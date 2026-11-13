/**
 * Title, description and Open Graph tags for every route. Shared by the app
 * (useDocumentMeta, on client-side navigation) and the build (vite.config.ts
 * bakes them into a static HTML file per route, because link previews on
 * LinkedIn, Slack or iMessage don't run JavaScript).
 */
import { publishedCaseStudies } from '../content/work/registry.ts'
import type { CaseStudy } from '../content/work/types.ts'

export const SITE_URL = 'https://www.giancarloforero.tech'
const SITE_NAME = 'Giancarlo Forero'
const DEFAULT_IMAGE = `${SITE_URL}/me.jpg`

export interface RouteMeta {
  path: string
  title: string
  description: string
  image: string
  imageAlt?: string
  type: 'website' | 'article'
}

export const homeMeta: RouteMeta = {
  path: '/',
  title: 'Giancarlo Forero · Portfolio',
  description:
    'Giancarlo Forero, software engineer and designer (full-stack, AI, cloud, UI/UX). An interactive portfolio that runs like an iPod classic.',
  image: DEFAULT_IMAGE,
  type: 'website',
}

export const workIndexMeta: RouteMeta = {
  path: '/work',
  title: `Design Work · ${SITE_NAME}`,
  description: 'UI/UX case studies and visual design by Giancarlo Forero: brand identity, web design and design systems.',
  image: DEFAULT_IMAGE,
  type: 'website',
}

export const notFoundMeta: RouteMeta = {
  path: '/404',
  title: `Page not found · ${SITE_NAME}`,
  description: homeMeta.description,
  image: DEFAULT_IMAGE,
  type: 'website',
}

const isReal = (value: string | undefined) => !!value && value.trim() !== '' && value.trim().toUpperCase() !== 'TODO'

export function caseStudyMeta(study: CaseStudy): RouteMeta {
  const cover = study.cover && isReal(study.cover.src) ? study.cover : undefined
  return {
    path: `/work/${study.slug}`,
    title: `${study.title} · Case study · ${SITE_NAME}`,
    description: study.summary,
    // og.jpg is the cover cropped to 1200×630 by scripts/build-work-assets.mjs.
    image: cover ? `${SITE_URL}/work/${study.slug}/og.jpg` : DEFAULT_IMAGE,
    imageAlt: cover?.alt,
    type: 'article',
  }
}

/** Routes that get their own static HTML at build time ("/" is index.html itself). */
export const prerenderedRoutes = (): RouteMeta[] => [workIndexMeta, ...publishedCaseStudies.map(caseStudyMeta)]

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The <head> tags for a route, as HTML (used at build time). */
export function renderMetaTags(meta: RouteMeta): string {
  const url = `${SITE_URL}${meta.path === '/' ? '/' : meta.path}`
  const tags: Array<[string, string, string]> = [
    ['name', 'description', meta.description],
    ['property', 'og:type', meta.type],
    ['property', 'og:site_name', SITE_NAME],
    ['property', 'og:title', meta.title],
    ['property', 'og:description', meta.description],
    ['property', 'og:url', url],
    ['property', 'og:image', meta.image],
    ...(meta.imageAlt ? [['property', 'og:image:alt', meta.imageAlt] as [string, string, string]] : []),
    ['name', 'twitter:card', 'summary_large_image'],
  ]
  return [
    `<title>${escape(meta.title)}</title>`,
    `<link rel="canonical" href="${escape(url)}" />`,
    ...tags.map(([attr, key, content]) => `<meta ${attr}="${key}" content="${escape(content)}" />`),
  ].join('\n    ')
}
