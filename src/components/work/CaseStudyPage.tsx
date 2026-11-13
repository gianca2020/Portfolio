import { Link, useParams } from 'react-router'
import { findCaseStudy, hasGallery, publishedCaseStudies } from '../../content/work'
import { caseStudyMeta } from '../../lib/siteMeta'
import { CaseStudy } from './CaseStudy'
import { NotFoundPage } from './NotFoundPage'
import { PageShell } from './PageShell'

/** /work/:slug — one published case study, or the not-found page. */
export function CaseStudyPage() {
  const study = findCaseStudy(useParams().slug)
  if (!study) return <NotFoundPage />

  const i = publishedCaseStudies.indexOf(study)
  const next = publishedCaseStudies.length > 1 ? publishedCaseStudies[(i + 1) % publishedCaseStudies.length] : undefined

  return (
    <PageShell meta={caseStudyMeta(study)}>
      <CaseStudy study={study} />
      {(next || hasGallery) && (
        <nav className="work-next" aria-label="More work">
          {next && (
            <Link to={`/work/${next.slug}`} className="work-next__link">
              <span className="work-next__label">Next case study</span>
              <span className="work-next__title">{next.title}</span>
            </Link>
          )}
          {hasGallery && (
            <Link to="/work" className="work-next__link">
              <span className="work-next__label">More</span>
              <span className="work-next__title">All design work</span>
            </Link>
          )}
        </nav>
      )}
    </PageShell>
  )
}
