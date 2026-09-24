import type { ReactNode } from 'react'
import type { Metric } from '../../data/types'
import { Separator } from './Separator'

interface EntryProps {
  /** Heading line, e.g. the role or project name. */
  title: string
  /** Second heading line, e.g. the organisation. */
  subtitle?: string
  /** Dates, right-aligned beside the title on wide screens. */
  when: ReactNode
  /** Location, right-aligned beside the subtitle on wide screens. */
  where?: string
  children?: ReactNode
}

/** One résumé entry: title/subtitle on the left, dates/location on the right, details below. */
export function Entry({ title, subtitle, when, where, children }: EntryProps) {
  return (
    <article className="rv-entry">
      <div className="grid gap-x-6 sm:grid-cols-[minmax(0,1fr)_auto]">
        <h3 className="text-[1.0625rem] leading-6 font-semibold text-(--rv-ink)">
          {title}
          {subtitle && (
            <>
              <span className="sr-only">, </span>
              <span className="block text-[0.9375rem] leading-[1.375rem] font-normal text-(--rv-ink-2)">
                {subtitle}
              </span>
            </>
          )}
        </h3>
        <p
          className={
            'mt-1 text-sm leading-[1.375rem] text-(--rv-ink-3) tabular-nums ' +
            'sm:mt-0 sm:text-right sm:leading-6 sm:whitespace-nowrap'
          }
        >
          {when}
          {where && (
            <>
              <Separator className="sm:hidden" />
              <span className="sm:block sm:leading-[1.375rem]">{where}</span>
            </>
          )}
        </p>
      </div>
      {children}
    </article>
  )
}

/** Accomplishment bullets under an entry. */
export function Bullets({ items }: { items: string[] }) {
  return (
    <ul
      className={
        'mt-2.5 list-disc space-y-1.5 pl-5 text-[0.9375rem] leading-relaxed text-(--rv-ink-2) ' +
        'marker:text-(--rv-ink-3)'
      }
    >
      {items.map((item) => (
        <li key={item} className="pl-1">
          {item}
        </li>
      ))}
    </ul>
  )
}

/** Headline numbers under an entry, e.g. "30+ FPS live frame analysis". */
export function Metrics({ items }: { items: Metric[] }) {
  return (
    <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-sm leading-normal text-(--rv-ink-2)">
      {items.map(({ value, label }) => (
        <li key={`${value} ${label}`}>
          <span className="font-semibold text-(--rv-ink) tabular-nums">{value}</span> {label}
        </li>
      ))}
    </ul>
  )
}
