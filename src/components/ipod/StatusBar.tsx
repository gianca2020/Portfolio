import type { ComponentType, CSSProperties, SVGProps } from 'react'
import { LCD_WIDTH, SPLIT_PANEL_WIDTH, STATUS_BAR_HEIGHT } from './constants'
import { BatteryIcon, IdleIcon, PauseIcon, PlayIcon } from './icons'
import { useLcdReducedMotion } from './lcd/hooks'
import { SLIDE_EASE_CSS, SLIDE_MS } from './lcd/motion'
import type { PlaybackStatus } from './state/playbackContext'
import './lcd.css'

export interface StatusBarProps {
  /** Current menu / screen title, centred. */
  title: string
  /** Drives the small playback glyph on the left. */
  playback: PlaybackStatus
  /**
   * 'split' → the bar spans only the left 160px (the firmware's split view, where
   * the artwork panel runs the full LCD height); 'full' → all 320px.
   */
  layout: 'split' | 'full'
}

/**
 * The title is centred in the bar and kept clear of both glyphs by equal
 * insets (battery 26px + 5px margin + 4px air), so it stays truly centred.
 */
const TITLE_INSET = 35

/** ▶ playing, ❚❚ paused, and a dimmed outline ▷ while nothing has played yet (stopped is not paused). */
const PLAYBACK_GLYPH: Record<PlaybackStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
  playing: PlayIcon,
  paused: PauseIcon,
  stopped: IdleIcon,
}

/**
 * The firmware's status bar: 19px silver gradient + 1px divider, playback glyph
 * left, title centred (Helvetica Bold 13), battery right. Decorative for
 * assistive tech — the engine's live region announces titles.
 */
export function StatusBar({ title, playback, layout }: StatusBarProps) {
  const reducedMotion = useLcdReducedMotion()
  const style: CSSProperties = {
    width: layout === 'split' ? SPLIT_PANEL_WIDTH : LCD_WIDTH,
    height: STATUS_BAR_HEIGHT,
    transition: reducedMotion ? 'none' : `width ${SLIDE_MS}ms ${SLIDE_EASE_CSS}`,
  }
  const PlaybackGlyph = PLAYBACK_GLYPH[playback]

  return (
    <div aria-hidden="true" className="lcd-statusbar absolute top-0 left-0 z-20 font-ipod" style={style}>
      <PlaybackGlyph className="absolute top-[4px] left-[5px] h-[12px] w-[11px]" />
      <p
        className="absolute top-0 truncate text-center text-[13px] leading-[19px] font-bold text-lcd-ink"
        style={{ left: TITLE_INSET, right: TITLE_INSET }}
      >
        {title}
      </p>
      <BatteryIcon className="absolute top-[4px] right-[5px] h-[13px] w-[26px]" />
    </div>
  )
}
