/**
 * Helvetica advance widths (1/1000 em) for printable ASCII, from Adobe's
 * Helvetica and Helvetica-Bold AFMs. Arimo — the LCD's web fallback — and Arial
 * share these exactly, so text can be fitted to the 320 × 240 grid without
 * measuring the DOM.
 */
const ASCII_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, // space – /
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, // 0 – ?
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, // @ – O
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, // P – _
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, // ` – o
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, // p – ~
]

const ASCII_REGULAR = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, // space – /
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, // 0 – ?
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, // @ – O
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, // P – _
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, // ` – o
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, // p – ~
]

const EXTRA_BOLD: Record<string, number> = {
  '·': 278,
  '–': 556,
  '—': 1000,
  '‘': 278,
  '’': 278,
  '“': 500,
  '”': 500,
  '…': 1000,
}

const EXTRA_REGULAR: Record<string, number> = {
  '·': 278,
  '–': 556,
  '—': 1000,
  '‘': 222,
  '’': 222,
  '“': 333,
  '”': 333,
  '…': 1000,
}

/** Typical lowercase advance, used for anything outside the table (accented letters etc.). */
const FALLBACK = 556

function emWidth(text: string, ascii: number[], extra: Record<string, number>): number {
  let total = 0
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    const width = code >= 32 && code <= 126 ? ascii[code - 32] : undefined
    total += width ?? extra[char] ?? FALLBACK
  }
  return total / 1000
}

/** Width of `text` in em units when set in Helvetica Bold. */
export const helveticaBoldEm = (text: string): number => emWidth(text, ASCII_BOLD, EXTRA_BOLD)

/** Width of `text` in em units when set in Helvetica (regular weight). */
export const helveticaEm = (text: string): number => emWidth(text, ASCII_REGULAR, EXTRA_REGULAR)

export interface FitOptions {
  /** Largest size to use (px). */
  max: number
  /** Never go below this size (px); longer text then truncates. */
  min: number
  /** Letter spacing in em (negative for tight poster type). */
  tracking?: number
}

/** Largest whole-pixel Helvetica Bold size at which `text` fits in `width` px. */
export function fitFontSize(text: string, width: number, { max, min, tracking = 0 }: FitOptions): number {
  const chars = [...text].length
  const em = helveticaBoldEm(text) + tracking * Math.max(chars - 1, 0)
  if (em <= 0) return max
  return Math.min(max, Math.max(min, Math.floor(width / em)))
}

/** Width of a string in px, e.g. `(s) => helveticaEm(s) * 11`. */
export type Measure = (text: string) => number

/**
 * Greedy word wrap, as the browser does it: whole words, breaking at spaces.
 * A word wider than `width` still gets a line of its own (and overflows it).
 */
export function wrapWords(text: string, width: number, measure: Measure): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (line && measure(next) > width) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  return line ? [...lines, line] : lines
}

/** Whether `text` wraps into at most `maxLines` lines of whole words, none wider than `width`. */
export function fitsInLines(text: string, width: number, maxLines: number, measure: Measure): boolean {
  const lines = wrapWords(text, width, measure)
  return lines.length <= maxLines && lines.every((line) => measure(line) <= width)
}

/**
 * As many whole items as fit on one Helvetica Bold line, joined by `separator`
 * (never a cut-off item). The first item is always kept, even when it alone is too wide.
 */
export function fitJoined(items: readonly string[], width: number, fontSize: number, separator = ' · '): string {
  let line = ''
  for (const item of items) {
    const next = line ? `${line}${separator}${item}` : item
    if (helveticaBoldEm(next) * fontSize > width) break
    line = next
  }
  return line || (items[0] ?? '')
}
