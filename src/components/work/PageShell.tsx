import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import { portfolio } from '../../data/portfolio'
import type { RouteMeta } from '../../lib/siteMeta'
import { useDocumentMeta } from '../../lib/useDocumentMeta'
import './work.css'

const { contact, profile } = portfolio

/**
 * Chrome shared by the design-work pages: skip link, header with the way back
 * to the iPod, a single <main>, and a contact footer. After an in-app
 * navigation, focus moves to the page's h1 so screen readers announce the new
 * page (on a fresh load it stays at the top, where the skip link is first).
 */
export function PageShell({ meta, children }: { meta: RouteMeta; children: ReactNode }) {
  useDocumentMeta(meta)
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (location.key === 'default') return
    mainRef.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
  }, [location.key])

  return (
    <div className="work-page">
      <a href="#main" className="work-skip">
        Skip to content
      </a>
      <header className="work-header">
        <nav className="work-header__nav" aria-label="Site">
          <NavLink to="/" className="work-header__back">
            <span aria-hidden="true">←</span> Back to iPod
          </NavLink>
          <NavLink to="/work" end className="work-header__link">
            Design Work
          </NavLink>
        </nav>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1} className="work-main">
        {children}
      </main>
      <footer className="work-footer">
        <div className="work-footer__inner">
          <p className="work-footer__name">{profile.name}</p>
          <ul className="work-footer__links" aria-label="Contact">
            <li>
              <a href={contact.email.href}>{contact.email.display}</a>
            </li>
            <li>
              <a href={contact.linkedin.href}>LinkedIn</a>
            </li>
            <li>
              <a href={contact.github.href}>GitHub</a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  )
}
