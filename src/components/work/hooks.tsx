import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

/* ── Reduced motion ───────────────────────────────────────────────────────── */

const MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export const usePrefersReducedMotion = () =>
  useSyncExternalStore(subscribeMotion, () => window.matchMedia(MOTION_QUERY).matches, () => true)

/* ── Lightbox ─────────────────────────────────────────────────────────────── */

interface LightboxImage {
  url: string
  width: number
  height: number
  alt: string
  caption?: string
}

/**
 * One modal <dialog> per page. showModal() makes the rest of the page inert,
 * so focus stays inside; Esc closes (native), as do the Close button and a
 * click on the backdrop. Focus goes back to the image that opened it.
 */
export function useLightbox() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const [image, setImage] = useState<LightboxImage | null>(null)

  const open = useCallback((next: LightboxImage, trigger: HTMLElement) => {
    triggerRef.current = trigger
    setImage(next)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (image && dialog && !dialog.open) dialog.showModal()
  }, [image])

  const onClose = () => {
    setImage(null)
    triggerRef.current?.focus()
  }

  // A click on the backdrop closes it; keyboard users have Esc and the Close button.
  const element = (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className="work-lightbox"
      aria-label={image ? `Enlarged image: ${image.caption ?? image.alt}` : 'Enlarged image'}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      {image && (
        <div className="work-lightbox__inner">
          <button type="button" className="work-lightbox__close" onClick={() => dialogRef.current?.close()} autoFocus>
            Close <span aria-hidden="true">✕</span>
          </button>
          <img src={image.url} alt={image.alt} width={image.width} height={image.height} className="work-lightbox__img" />
          {image.caption && <p className="work-lightbox__caption">{image.caption}</p>}
        </div>
      )}
    </dialog>
  )

  return { open, element }
}

export type OpenLightbox = ReturnType<typeof useLightbox>['open']
