import { Link } from 'react-router'
import { asset, gallery, hasText, publishedCaseStudies, type GalleryItem } from '../../content/work'
import { workIndexMeta } from '../../lib/siteMeta'
import { useLightbox, type OpenLightbox } from './hooks'
import { CaseImage } from './Media'
import { PageShell } from './PageShell'

const GALLERY_FOLDER = 'gallery'

function GalleryCard({ item, onOpen }: { item: GalleryItem; onOpen: OpenLightbox }) {
  const images = item.images
    .map((image, i) => ({ image, format: item.formats?.[i] }))
    .filter(({ image }) => asset(GALLERY_FOLDER, image.src))
  if (images.length === 0 || !hasText(item.title)) return null
  const grouped = (item.formats?.length ?? 0) > 1

  return (
    <li className={`work-gallery__card${grouped ? ' work-gallery__card--formats' : ''}`}>
      <ul className={`work-gallery__images${grouped ? ' work-gallery__images--formats' : ''}`} aria-label={grouped ? 'Formats' : undefined}>
        {images.map(({ image, format }) => (
          <li key={image.src}>
            <figure className="work-figure">
              <CaseImage folder={GALLERY_FOLDER} image={image} caption={format} onOpen={onOpen} />
              {hasText(format) && <figcaption className="work-format-label">{format}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
      <h3 className="work-card__title">{item.title}</h3>
      {hasText(item.role) && <p className="work-card__meta">{item.role}</p>}
      {hasText(item.description) && <p>{item.description}</p>}
      {item.link && hasText(item.link.href) && (
        <a className="work-inline-link" href={item.link.href} target="_blank" rel="noopener noreferrer">
          {item.link.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </li>
  )
}

/** /work — every published case study, then the gallery of one-off pieces (hidden while empty). */
export function WorkIndexPage() {
  const lightbox = useLightbox()
  const pieces = gallery.filter((item) => item.images.some((image) => asset(GALLERY_FOLDER, image.src)))

  return (
    <PageShell meta={workIndexMeta}>
      <div className="work-index">
        <header className="work-index__header">
          <p className="work-eyebrow">Giancarlo Forero</p>
          <h1 className="work-hero__title" tabIndex={-1}>
            Design Work
          </h1>
          <p className="work-lead">UI/UX case studies and visual design, from brand identity to the web.</p>
        </header>

        {publishedCaseStudies.length > 0 && (
          <section className="work-section work-section--wide" aria-labelledby="case-studies-title">
            <h2 id="case-studies-title" className="work-section__title">
              Case studies
            </h2>
            <ul className="work-studies">
              {publishedCaseStudies.map((study) => {
                const cover = study.cover && asset(study.slug, study.cover.src)
                return (
                  <li key={study.slug} className="work-study">
                    {cover && (
                      <img
                        src={cover.url}
                        alt=""
                        width={cover.width}
                        height={cover.height}
                        loading="lazy"
                        decoding="async"
                        className="work-study__cover"
                      />
                    )}
                    <div className="work-study__text">
                      <h3 className="work-study__title">
                        <Link to={`/work/${study.slug}`} className="work-study__link">
                          {study.title}
                        </Link>
                      </h3>
                      {hasText(study.snapshot.role) && <p className="work-card__meta">{study.snapshot.role}</p>}
                      {hasText(study.summary) && <p>{study.summary}</p>}
                      <span className="work-study__cta" aria-hidden="true">
                        Read the case study →
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {pieces.length > 0 && (
          <section className="work-section work-section--wide" aria-labelledby="gallery-title">
            <h2 id="gallery-title" className="work-section__title">
              More design work
            </h2>
            <ul className="work-gallery">
              {pieces.map((item) => (
                <GalleryCard key={item.title} item={item} onOpen={lightbox.open} />
              ))}
            </ul>
          </section>
        )}
      </div>
      {lightbox.element}
    </PageShell>
  )
}
