import { useSyncExternalStore } from 'react'

export type Route = 'ipod' | 'recruiter'

const parse = (hash: string): Route => (/^#\/?recruiter\b/.test(hash) ? 'recruiter' : 'ipod')

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** Tiny hash router: `#/recruiter` shows Recruiter View, anything else the iPod. */
export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, () => parse(window.location.hash), () => 'ipod')
}
