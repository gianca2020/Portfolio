/**
 * Client-side navigation for code that lives outside React Router's tree of
 * hooks, like the iPod's menu actions. The router registers itself on mount;
 * until then (or in tests) this falls back to a full page load.
 */
type Navigate = (to: string) => void

let navigate: Navigate | undefined

export function registerNavigate(fn: Navigate) {
  navigate = fn
  return () => {
    if (navigate === fn) navigate = undefined
  }
}

export function navigateTo(to: string) {
  if (navigate) navigate(to)
  else window.location.assign(to)
}
