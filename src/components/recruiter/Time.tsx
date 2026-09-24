import { toDateTime } from './format'

/** A display date ("Jun 2026") as `<time>` when it is machine-readable, plain text otherwise ("Present"). */
export function Time({ value }: { value: string }) {
  const dateTime = toDateTime(value)
  return dateTime ? <time dateTime={dateTime}>{value}</time> : <>{value}</>
}

export function DateRange({ start, end }: { start: string; end: string }) {
  return (
    <>
      <Time value={start} /> – <Time value={end} />
    </>
  )
}
