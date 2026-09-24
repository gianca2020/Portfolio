import type { ReactNode } from 'react'

interface SectionProps {
  /** Slug for the heading id (prefixed, since the hidden iPod page shares the document). */
  id: string
  title: string
  children: ReactNode
}

/** A résumé section: label in a left rail on wide screens, stacked above the content on narrow ones. */
export function Section({ id, title, children }: SectionProps) {
  const headingId = `rv-${id}`
  return (
    <section
      aria-labelledby={headingId}
      className={
        'rv-section grid gap-x-10 gap-y-5 border-t border-(--rv-rule) py-9 md:grid-cols-[8rem_minmax(0,1fr)] ' +
        'print:grid-cols-[7.5rem_minmax(0,1fr)] print:gap-x-6 print:py-5'
      }
    >
      <h2
        id={headingId}
        className="text-[0.8125rem] leading-6 font-semibold tracking-[0.08em] text-(--rv-ink-2) uppercase md:pt-px"
      >
        {title}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}
