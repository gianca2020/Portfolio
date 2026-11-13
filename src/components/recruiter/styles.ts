/**
 * Shared class strings for Recruiter View. Colours come from the `--rv-*`
 * tokens in recruiter.css; type is rem-based so it follows the reader's font
 * size (and the print stylesheet can scale the whole page).
 */

/** Page column: ~52rem of content, with gutters that clear notches (the viewport uses viewport-fit=cover). */
export const pageColumn =
  'mx-auto w-full max-w-[55rem] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] ' +
  'sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]'

const button =
  'inline-flex shrink-0 items-center gap-1.5 rounded-md font-medium whitespace-nowrap ' +
  'transition-colors duration-150 motion-reduce:transition-none'

// The top-bar buttons tighten below `sm` so the name still fits beside them on a 320px screen.

/** Solid accent button (the one primary action: download the PDF). */
export const primaryButton =
  `${button} h-9 px-2 text-sm max-sm:gap-1 sm:px-3 ` +
  'bg-(--rv-accent) text-(--rv-accent-ink) hover:bg-(--rv-accent-hover)'

/** Borderless button for secondary navigation. */
export const quietButton =
  `${button} h-9 px-1.5 text-sm max-sm:gap-1 sm:px-2.5 ` +
  'text-(--rv-ink-2) hover:bg-(--rv-wash) hover:text-(--rv-ink)'

/** Small bordered button for project links. */
export const outlineButton =
  `${button} rv-link-button h-8 border border-(--rv-rule-strong) px-2.5 text-sm text-(--rv-ink) ` +
  'hover:border-(--rv-accent) hover:text-(--rv-accent)'

/** Inline text link: accent colour, always underlined so it doesn't rely on colour alone. */
export const textLink = 'rv-text-link font-medium text-(--rv-accent) underline underline-offset-[3px]'

/** Geometry here; the skin (stage-token colours and states) lives in recruiter-button.css. Shared with the iPod's Expand button. */
export const STAGE_BUTTON_CLASS = [
  'recruiter-button fixed z-50',
  'top-[max(12px,env(safe-area-inset-top))] right-[max(12px,env(safe-area-inset-right))]',
  'inline-flex h-[34px] items-center gap-[7px] rounded-[7px] pr-[12px] pl-[10px]',
  'font-sans text-[13px] leading-none font-medium whitespace-nowrap select-none',
].join(' ')
