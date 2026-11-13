import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { menuTree } from '../../ipod/data'
import { asset, gallery } from '../../../content/work'
import { WorkIndexPage } from '../WorkIndexPage'

const html = renderToStaticMarkup(
  <MemoryRouter initialEntries={['/work']}>
    <WorkIndexPage />
  </MemoryRouter>,
)

describe('gallery', () => {
  it('ships only pieces whose every image is published', () => {
    expect(gallery.length).toBeGreaterThan(0)
    for (const item of gallery) {
      for (const image of item.images) expect(asset('gallery', image.src), image.src).toBeDefined()
      if (item.formats) expect(item.formats).toHaveLength(item.images.length)
    }
  })

  it('renders under “More design work”, grouping formats with a label under each', () => {
    expect(html).toContain('>More design work</h2>')
    expect(html.match(/work-gallery__card--formats/g)).toHaveLength(gallery.filter((i) => (i.formats?.length ?? 0) > 1).length)
    for (const format of ['Print poster', 'Instagram post', 'Instagram Story']) {
      expect(html).toContain(`<figcaption class="work-format-label">${format}</figcaption>`)
    }
    const galleryImages = gallery.reduce((n, i) => n + i.images.length, 0)
    expect(html.match(/src="\/work\/gallery\//g)).toHaveLength(galleryImages)
    expect(html).not.toMatch(/TODO/)
  })

  it('lists More Design Work on the iPod now that the gallery has pieces', () => {
    const designWork = menuTree.children.find((n) => n.id === 'design-work')
    const last = designWork?.kind === 'menu' ? designWork.children.at(-1) : undefined
    expect(last).toMatchObject({ label: 'More Design Work', action: { type: 'navigate', to: '/work' } })
  })
})
