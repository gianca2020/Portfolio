import { useEffect } from 'react'
import { SITE_URL, type RouteMeta } from './siteMeta'

function setTag(attr: 'name' | 'property', key: string, content: string | undefined) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!content) return tag?.remove()
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

/** Keeps <title>, description, canonical and Open Graph tags in step with the current route. */
export function useDocumentMeta(meta: RouteMeta) {
  useEffect(() => {
    const url = `${SITE_URL}${meta.path}`
    document.title = meta.title
    setTag('name', 'description', meta.description)
    setTag('property', 'og:type', meta.type)
    setTag('property', 'og:title', meta.title)
    setTag('property', 'og:description', meta.description)
    setTag('property', 'og:url', url)
    setTag('property', 'og:image', meta.image)
    setTag('property', 'og:image:alt', meta.imageAlt)
    document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', url)
  }, [meta])
}
