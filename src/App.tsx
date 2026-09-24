import { useEffect } from 'react'
import { IPodPage } from './components/ipod/IPodPage'
import { RecruiterView } from './components/recruiter/RecruiterView'
import { useHashRoute } from './lib/useHashRoute'

export default function App() {
  const route = useHashRoute()
  const recruiter = route === 'recruiter'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [recruiter])

  return (
    <>
      <IPodPage active={!recruiter} />
      {recruiter && <RecruiterView />}
    </>
  )
}
