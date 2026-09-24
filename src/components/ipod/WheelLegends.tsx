import { DEVICE_MM } from './constants'

const SIZE = DEVICE_MM.wheel.diameter
const C = SIZE / 2
const { menu, skip, playPause, capHeight, fontSize, tracking } = DEVICE_MM.labels
const HALF = capHeight / 2

/* Glyph proportions measured from the 6th-generation wheel (mm). */
const SKIP_WIDTH = 3.6
const SKIP_BAR = 0.36
const PLAY_TRIANGLE = 1.8
const PLAY_TO_BARS = 1.0
const PAUSE_BAR = 0.57
const PAUSE_GAP = 0.5

const round = (n: number) => Math.round(n * 1000) / 1000

/** Two touching triangles and a bar: ▶▶| (direction 1) or |◀◀ (direction −1), centred on (cx, cy). */
function skipPath(cx: number, cy: number, direction: 1 | -1): string {
  const triangle = (SKIP_WIDTH - SKIP_BAR) / 2
  // Local x runs from the triangles' bases toward the bar; `at` maps it onto the page either way round.
  const at = (x: number) => round(cx + direction * (x - SKIP_WIDTH / 2))
  const top = round(cy - HALF)
  const bottom = round(cy + HALF)
  const tri = (from: number) => `M${at(from)} ${top}L${at(from + triangle)} ${cy}L${at(from)} ${bottom}Z`
  const [barFrom, barTo] = [at(2 * triangle), at(SKIP_WIDTH)]
  const bar = `M${barFrom} ${top}L${barTo} ${top}L${barTo} ${bottom}L${barFrom} ${bottom}Z`
  return tri(0) + tri(triangle) + bar
}

/** ▶❚❚ centred on (cx, cy). */
function playPausePath(cx: number, cy: number): string {
  const width = PLAY_TRIANGLE + PLAY_TO_BARS + PAUSE_BAR * 2 + PAUSE_GAP
  const x0 = cx - width / 2
  const top = round(cy - HALF)
  const bottom = round(cy + HALF)
  const rect = (x: number) =>
    `M${round(x)} ${top}L${round(x + PAUSE_BAR)} ${top}L${round(x + PAUSE_BAR)} ${bottom}L${round(x)} ${bottom}Z`
  const firstBar = x0 + PLAY_TRIANGLE + PLAY_TO_BARS
  return (
    `M${round(x0)} ${top}L${round(x0 + PLAY_TRIANGLE)} ${cy}L${round(x0)} ${bottom}Z` +
    rect(firstBar) +
    rect(firstBar + PAUSE_BAR + PAUSE_GAP)
  )
}

const GLYPHS = skipPath(C - skip, C, -1) + skipPath(C + skip, C, 1) + playPausePath(C, C + playPause)

// Letter-spacing also trails the last letter; shift right by half of it so MENU is optically centred.
const MENU_X = round(C + (parseFloat(tracking) * fontSize) / 2)
const MENU_BASELINE = round(C - menu + HALF)
const MENU_STYLE = { fontSize, fontWeight: 700, letterSpacing: tracking }

/**
 * The legends printed on the click wheel, drawn in wheel millimetres
 * (the viewBox is the wheel itself, so they scale with it exactly).
 */
export function WheelLegends() {
  return (
    <svg
      className="ipod-wheel__legends"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      focusable="false"
    >
      <text x={MENU_X} y={MENU_BASELINE} textAnchor="middle" className="font-ipod" style={MENU_STYLE}>
        MENU
      </text>
      <path d={GLYPHS} />
    </svg>
  )
}
