/**
 * Geometry of the 6th-generation iPod classic.
 *
 * The chassis is laid out in millimetres of the real device (1 unit = 1 mm,
 * scaled to the viewport through the `--u` CSS variable). The LCD content is
 * authored on the display's native 320 × 240 pixel grid and scaled to fit the
 * glass, so typography and spacing keep the original proportions everywhere.
 */
/**
 * Front-face geometry in millimetres, from Apple's CAD drawing of the iPod
 * classic (Accessory Design Guidelines R1, figs 7-55/7-56). Origin: top-left.
 */
export const DEVICE_MM = {
  width: 61.8,
  height: 103.5,
  /** Blended corner; ≈ a 6.5 mm circle. */
  cornerRadius: 6.5,
  /** Black glass window around the LCD. */
  window: { x: 4.9, y: 4.95, width: 52.0, height: 39.5, radius: 1.5 },
  /** Lit LCD area, centred in the window (≈1.05 mm black border). */
  lcd: { width: 49.9, height: 37.4 },
  /** Click wheel: centred horizontally, centre 73.1 mm from the top. */
  wheel: { cx: 30.9, cy: 73.1, diameter: 38.0 },
  centerButton: { diameter: 13.7 },
  /** Printed legends: distance of each label's centre from the wheel centre. */
  labels: { menu: 15.9, skip: 15.15, playPause: 16.1, capHeight: 1.8, fontSize: 2.65, tracking: '0.07em' },
  /** Beveled band of the front plate (lighter/darker gradient bands). */
  bevel: { aroundScreen: 4.7, belowScreen: 7.7 },
} as const

export const LCD_WIDTH = 320
export const LCD_HEIGHT = 240
/** Height of the status bar on the 320 × 240 grid. */
export const STATUS_BAR_HEIGHT = 20
/** Height of the screen area below the status bar. */
export const SCREEN_HEIGHT = LCD_HEIGHT - STATUS_BAR_HEIGHT
/**
 * The firmware fits exactly 9 single-line rows in the 220px list area, alternating
 * 24 / 25px; `rowTop` / `rowHeight` in lcd/menuWindow.ts reproduce that rhythm.
 */
export const MENU_VISIBLE_ROWS = 9
/** Split view: exactly 160 / 160. */
export const SPLIT_PANEL_WIDTH = LCD_WIDTH / 2

/** Degrees of wheel rotation per highlight step (spec: 15–20°). */
export const DEGREES_PER_STEP = 18

/** Menu slide transition (seconds). Fast and mechanical, no spring; the firmware's sweep accelerates. */
export const SLIDE_DURATION = 0.26
