import { useEffect, useRef, type ReactNode } from 'react'
import { asset, hasText, posterFor, type ImageMedia, type Media } from '../../content/work'
import { usePrefersReducedMotion, type OpenLightbox } from './hooks'

/* ── Image, video, figure ─────────────────────────────────────────────────── */

interface ImageProps {
  folder: string
  image: Pick<ImageMedia, 'src' | 'alt'>
  caption?: string
  onOpen: OpenLightbox
  /** The hero cover loads eagerly; everything else is lazy. */
  priority?: boolean
}

/** A zoomable image, or nothing when its file hasn't been published. */
export function CaseImage({ folder, image, caption, onOpen, priority = false }: ImageProps) {
  const file = asset(folder, image.src)
  if (!file) return null
  return (
    <button
      type="button"
      className="work-zoom"
      aria-haspopup="dialog"
      onClick={(event) => onOpen({ ...file, alt: image.alt, caption: hasText(caption) ? caption : undefined }, event.currentTarget)}
    >
      <img
        src={file.url}
        alt={image.alt}
        width={file.width}
        height={file.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
      <span className="work-zoom__hint" aria-hidden="true">
        View larger
      </span>
      <span className="sr-only">, view larger</span>
    </button>
  )
}

/** Muted, looping clip with controls. Autoplays unless the visitor prefers reduced motion. */
export function CaseVideo({ folder, src, alt }: { folder: string; src: string; alt: string }) {
  const file = asset(folder, src)
  const poster = asset(folder, posterFor(src))
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    if (reduced) video.pause()
    else video.play().catch(() => {})
  }, [reduced])

  if (!file) return null
  return (
    <video
      ref={ref}
      className="work-video"
      src={file.url}
      poster={poster?.url}
      width={file.width}
      height={file.height}
      aria-label={alt}
      muted
      loop
      playsInline
      controls
      preload={reduced ? 'none' : 'metadata'}
    />
  )
}

/** Media plus optional caption, or nothing when the file is missing. */
export function MediaFigure({
  folder,
  media,
  caption,
  onOpen,
  className,
}: {
  folder: string
  media: Media
  caption?: string
  onOpen: OpenLightbox
  className?: string
}): ReactNode {
  if (!asset(folder, media.src)) return null
  return (
    <figure className={['work-figure', className].filter(Boolean).join(' ')}>
      {media.type === 'video' ? (
        <CaseVideo folder={folder} src={media.src} alt={media.alt} />
      ) : (
        <CaseImage folder={folder} image={media} caption={caption} onOpen={onOpen} />
      )}
      {hasText(caption) && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
