import { useEffect } from 'react'
import { IPodPage } from './components/ipod/IPodPage'
// Recruiter View is temporarily disabled. To restore it, uncomment the import,
// the route logic, and the render below (and the entry points in IPodPage.tsx,
// data.ts and detail/blocks.ts).
// import { RecruiterView } from './components/recruiter/RecruiterView'
// import { useHashRoute } from './lib/useHashRoute'

export default function App() {
  // const route = useHashRoute()
  // const recruiter = route === 'recruiter'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <IPodPage active />
      {/* {recruiter && <RecruiterView />} */}
    </>
  )
}
