import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { portfolio } from '../../data/portfolio'
import { RecruiterButton } from '../recruiter/RecruiterButton'
import './chassis.css'
import { DEVICE_MM } from './constants'
import { IPod } from './IPod'
import { PlaybackProvider } from './state/PlaybackProvider'
import { SettingsProvider } from './state/SettingsProvider'
import { useSettings, type ChassisTheme } from './state/settingsContext'

const { profile } = portfolio

/** Device scale limits (px per mm). */
const MIN_U = 2.6
const MAX_U = 8.4
/** Browsers' default root font size. */
const DEFAULT_REM = 16
/** px per mm of height fit gained per px of default text size above 16: a 6.4 px/mm device grows in proportion. */
const TEXT_GROWTH = 6.4 / DEFAULT_REM

/*
 * px per mm: the largest size at which the whole device fits between the side
 * gutters and between the reserved top (Recruiter View button, name tag) and
 * bottom (hint line) bands. The bands are CSS variables tuned per breakpoint in
 * chassis.css. The spare 1px keeps sub-pixel rounding from adding a scrollbar.
 *
 * Browser zoom shrinks the viewport too, so it barely changes the fit (Recruiter
 * View is the zoomable alternative). A reader who has raised the default text
 * size (or zooms text only) gets a taller device and a scrolling page instead;
 * the width fit still bounds it so nothing scrolls sideways.
 */
const RESERVED_HEIGHT = 'var(--stage-reserve-top) - var(--stage-hint-block) - var(--stage-reserve-bottom) - 1px'
const TEXT_SIZE_BONUS = `max(0px, 1rem - ${DEFAULT_REM}px) * ${TEXT_GROWTH}`
const FIT_WIDTH = `(100vw - var(--stage-gutter-left) - var(--stage-gutter-right)) / ${DEVICE_MM.width}`
const FIT_HEIGHT = `(var(--stage-vh) - ${RESERVED_HEIGHT}) / ${DEVICE_MM.height} + ${TEXT_SIZE_BONUS}`
const LIMIT_U = `max(${MAX_U}px, ${MAX_U / DEFAULT_REM}rem)`
const STAGE_STYLE = { '--u': `clamp(${MIN_U}px, min(${FIT_WIDTH}, ${FIT_HEIGHT}), ${LIMIT_U})` } as CSSProperties

/** Mirror the finish on <html> (overscroll areas, body background) and in the browser's theme colour. */
function useDocumentFinish(theme: ChassisTheme, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousFinish = root.getAttribute('data-finish')
    const previousColor = meta?.getAttribute('content') ?? null

    root.setAttribute('data-finish', theme)
    const stageTop = getComputedStyle(root).getPropertyValue('--stage-top').trim()
    if (meta && stageTop) meta.setAttribute('content', stageTop)

    return () => {
      if (previousFinish === null) root.removeAttribute('data-finish')
      else root.setAttribute('data-finish', previousFinish)
      if (meta && previousColor !== null) meta.setAttribute('content', previousColor)
    }
  }, [theme, enabled])
}

/**
 * Returning from Recruiter View unmounts the focused "Back to iPod" link, which
 * would drop focus to <body>. Put it on the click wheel so keyboard and
 * screen-reader users land back on the device.
 */
function useRestoreFocus(active: boolean, stage: RefObject<HTMLElement | null>) {
  const wasActive = useRef(active)
  useEffect(() => {
    if (active && !wasActive.current) {
      stage.current?.querySelector<HTMLElement>('[role="slider"]')?.focus({ preventScroll: true })
    }
    wasActive.current = active
  }, [active, stage])
}

/** Full-viewport stage that centres the device; everything else stays quiet. */
function IPodStage({ active }: { active: boolean }) {
  const { settings, reducedMotion } = useSettings()
  const stageRef = useRef<HTMLElement>(null)
  useDocumentFinish(settings.theme, active)
  useRestoreFocus(active, stageRef)

  return (
    <main
      ref={stageRef}
      className="ipod-stage"
      data-finish={settings.theme}
      data-reduced-motion={reducedMotion}
      hidden={!active}
      style={STAGE_STYLE}
    >
      <h1 className="sr-only">
        {profile.name} — {profile.title}. Interactive iPod classic portfolio.
      </h1>
      <RecruiterButton />
      {/* Repeats the heading visually; hidden from assistive tech to avoid reading it twice. */}
      <div className="ipod-nametag" aria-hidden="true">
        <p className="ipod-nametag__name">{profile.name}</p>
        <p className="ipod-nametag__title">{profile.title}</p>
      </div>
      <div className="ipod-stage__body">
        <div className="ipod-stage__device">
          <IPod active={active} />
        </div>
        <p className="ipod-hint">
          <span className="ipod-hint__fine">↑ ↓ scroll · Enter select · Esc back · or drag around the wheel</span>
          <span className="ipod-hint__coarse">Slide your thumb around the wheel · tap the centre to select</span>
        </p>
      </div>
    </main>
  )
}

/**
 * The iPod experience. Stays mounted (hidden) while Recruiter View is open so
 * navigation history survives a round trip.
 */
export function IPodPage({ active }: { active: boolean }) {
  return (
    <SettingsProvider>
      <PlaybackProvider>
        <IPodStage active={active} />
      </PlaybackProvider>
    </SettingsProvider>
  )
}
