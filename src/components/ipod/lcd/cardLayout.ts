import type { Experience } from '../../../data/types'
import { LCD_HEIGHT, SPLIT_PANEL_WIDTH } from '../constants'
import { fitsInLines, helveticaBoldEm, helveticaEm, wrapWords } from './textMetrics'

/**
 * Text block of a split-view card (see CardPreviews): the 160px panel less 12px
 * left and 8px right padding, and the 80px beneath the square figure less 6px.
 */
export const CARD_TEXT_WIDTH = SPLIT_PANEL_WIDTH - 12 - 8
export const CARD_TEXT_HEIGHT = LCD_HEIGHT - SPLIT_PANEL_WIDTH - 6

/** Leading of the 11px role and summary lines and the 10.5px dates line. */
const LINE = 13
/** Space above the summary. */
const SUMMARY_GAP = 2

export interface OrgStyle {
  /** Helvetica Bold size (px). */
  size: number
  leading: number
  lines: number
}

/** One line at the card's name size, else two slightly smaller lines. */
const ORG_STYLES: OrgStyle[] = [
  { size: 13, leading: 15, lines: 1 },
  { size: 12, leading: 14, lines: 2 },
]

export interface ExperienceCardLayout {
  /** What the organisation line shows: the full name, or the menu label when the name cannot fit. */
  organization: string
  org: OrgStyle
  /** Lines the 11px role wraps to (1–2). */
  roleLines: number
  /** Whole summary lines that fit in what is left (0–2). */
  summaryLines: number
}

const roleMeasure = (text: string) => helveticaEm(text) * 11

function organisationLine(organization: string, menuLabel: string): { text: string; style: OrgStyle } {
  for (const text of [organization, menuLabel]) {
    const style = ORG_STYLES.find(({ size, lines }) =>
      fitsInLines(text, CARD_TEXT_WIDTH, lines, (s) => helveticaBoldEm(s) * size),
    )
    if (style) return { text, style }
  }
  // Neither fits: the full name, clamped to two lines.
  return { text: organization, style: ORG_STYLES[ORG_STYLES.length - 1] }
}

/**
 * Lays out a role's card so the organisation and role are never cut to a
 * fragment: the organisation takes one line, or two smaller ones, and falls
 * back to the (shorter) menu label only when the full name cannot fit either
 * way. The role wraps to two lines when it has to, and the summary gets the
 * whole lines left over.
 */
export function experienceCardLayout({
  organization,
  menuLabel,
  role,
}: Pick<Experience, 'organization' | 'menuLabel' | 'role'>): ExperienceCardLayout {
  const { text, style } = organisationLine(organization, menuLabel)
  const roleLines = Math.min(2, Math.max(1, wrapWords(role, CARD_TEXT_WIDTH, roleMeasure).length))
  // Organisation, role, then the one-line dates.
  const used = style.leading * style.lines + LINE * roleLines + LINE
  const summaryLines = Math.min(2, Math.max(0, Math.floor((CARD_TEXT_HEIGHT - used - SUMMARY_GAP) / LINE)))
  return { organization: text, org: style, roleLines, summaryLines }
}
