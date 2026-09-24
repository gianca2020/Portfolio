const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/**
 * Machine-readable `<time dateTime>` value for a display date from the content
 * model: "Jun 2026" → "2026-06", "September 2026" → "2026-09", "2027" → "2027".
 * Anything else (e.g. "Present") returns undefined so callers render plain text.
 */
export function toDateTime(display: string): string | undefined {
  const match = /^(?:([a-z]{3,})\.?\s+)?(\d{4})$/i.exec(display.trim())
  if (!match) return undefined
  const [, monthName, year] = match
  if (!monthName) return year
  const month = MONTHS.indexOf(monthName.slice(0, 3).toLowerCase())
  return month < 0 ? undefined : `${year}-${String(month + 1).padStart(2, '0')}`
}

/** Whether a display date's month is still ahead of `now` — e.g. a graduation that is "Expected". */
export function isUpcoming(display: string, now: Date = new Date()): boolean {
  const value = toDateTime(display)
  if (!value) return false
  const [year, month = 12] = value.split('-').map(Number)
  return year * 12 + month > now.getFullYear() * 12 + now.getMonth() + 1
}

/** Compact URL for printed pages: "https://www.github.com/a/b/" → "github.com/a/b". */
export function shortUrl(href: string): string {
  return href
    .replace(/^(?:[a-z][a-z\d+.-]*:\/\/|mailto:)/i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')
}
