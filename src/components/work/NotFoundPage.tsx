import { Link } from 'react-router'
import { notFoundMeta } from '../../lib/siteMeta'
import { PageShell } from './PageShell'

export function NotFoundPage() {
  return (
    <PageShell meta={notFoundMeta}>
      <div className="work-empty">
        <h1 className="work-hero__title" tabIndex={-1}>
          Page not found
        </h1>
        <p className="work-lead">That page doesn’t exist, or it has moved.</p>
        <p className="work-links">
          <Link className="work-button" to="/">
            Back to portfolio
          </Link>
          <Link className="work-button work-button--quiet" to="/work">
            See design work
          </Link>
        </p>
      </div>
    </PageShell>
  )
}
