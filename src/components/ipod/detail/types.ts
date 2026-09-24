import type { ArtworkSpec, Metric } from '../../../data/types'
import type { MenuAction, PreviewIcon } from '../types'

/** Artwork (or profile photo / document thumbnail) beside a title, subtitle and meta line. */
export interface HeroBlock {
  type: 'hero'
  title: string
  subtitle?: string
  meta?: string
  artwork?: ArtworkSpec
  /** Profile photo variant: image URL and initials fallback. */
  photo?: { src?: string; initials: string }
  /** Paper-page thumbnail (the résumé) instead of artwork. */
  document?: boolean
}

/** Selectable row (GitHub, Live Site, Download…). Always rendered after content blocks. */
export interface ActionBlock {
  type: 'action'
  label: string
  icon?: PreviewIcon
  action: MenuAction
  /** Short right-aligned value, e.g. "github.com/gianca2020". */
  detail?: string
}

/**
 * Building blocks of a scrolling detail screen. Detail screens (project, role,
 * about, résumé) are data: they map content to `DetailBlock[]` and hand it to
 * <DetailView>, which owns scrolling, wheel/keyboard stepping and action rows.
 */
export type DetailBlock =
  | HeroBlock
  /** Silver section band. */
  | { type: 'heading'; text: string }
  /** Body paragraph; 'caption' is the small grey footnote style. */
  | { type: 'text'; text: string; tone?: 'body' | 'caption' }
  /** Dot-separated inline list (tech stack), optionally under a small label. */
  | { type: 'tags'; items: string[]; label?: string }
  | { type: 'bullets'; items: string[] }
  /** iPod "Settings › About"-style key/value rows. */
  | { type: 'kv'; rows: { key: string; value: string }[] }
  | { type: 'metrics'; items: Metric[] }
  /** Compact résumé entry: bold title, grey meta line, one-line summary. */
  | { type: 'entry'; title: string; meta?: string; text?: string }
  | ActionBlock

export type ContentBlock = Exclude<DetailBlock, ActionBlock>
