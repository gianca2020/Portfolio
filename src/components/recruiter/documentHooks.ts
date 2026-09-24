import { useEffect, type RefObject } from 'react'

/** Sets `document.title` while mounted and restores the previous title afterwards. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}

/**
 * While mounted, tints the browser chrome (`<meta name="theme-color">`) with the
 * element's `--rv-bg`, following light/dark changes, then restores the stage tint.
 */
export function useThemeColor(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const root = ref.current
    if (!meta || !root) return
    const previous = meta.content
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => {
      meta.content = getComputedStyle(root).getPropertyValue('--rv-bg').trim() || previous
    }
    sync()
    scheme.addEventListener('change', sync)
    return () => {
      scheme.removeEventListener('change', sync)
      meta.content = previous
    }
  }, [ref])
}
