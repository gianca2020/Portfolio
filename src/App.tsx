import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { IPodPage } from './components/ipod/IPodPage'
import { registerNavigate } from './lib/navigate'
import { homeMeta } from './lib/siteMeta'
import { useDocumentMeta } from './lib/useDocumentMeta'
// Recruiter View is temporarily disabled. To restore it, uncomment the import,
// the route logic, and the render below (and the entry points in IPodPage.tsx,
// data.ts and detail/blocks.ts).
// import { RecruiterView } from './components/recruiter/RecruiterView'
// import { useHashRoute } from './lib/useHashRoute'

/**
 * Root layout. The iPod lives at "/" and stays mounted (hidden) on the other
 * routes, so a round trip to a case study keeps the menu where the visitor
 * left it and hands focus back to the click wheel.
 */
export default function App() {
  // const route = useHashRoute()
  // const recruiter = route === 'recruiter'
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const onIPod = pathname === '/'

  useEffect(() => registerNavigate((to) => navigate(to)), [navigate])

  return (
    <>
      <IPodPage active={onIPod} />
      {/* {recruiter && <RecruiterView />} */}
      <Outlet />
      <ScrollRestoration />
    </>
  )
}

/** "/" itself renders nothing on top of the iPod; it only sets the page's meta. */
export function IPodRoute() {
  useDocumentMeta(homeMeta)
  return null
}
