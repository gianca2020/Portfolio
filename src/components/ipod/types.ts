import type { ArtworkSpec } from '../../data/types'

/* ────────────────────────────────────────────────────────────────────────────
 * Menu tree
 *
 * The iPod's whole information architecture is one tree of `IPodNode`s built
 * from portfolio content in `data.ts`. The navigation engine only knows about
 * node ids and kinds — never about projects or companies — so content can grow
 * without touching navigation code.
 * ──────────────────────────────────────────────────────────────────────────── */

export type SettingKey = 'sound' | 'theme' | 'reduceMotion'

/** Glyphs available to info previews and detail action rows (see icons.tsx). */
export type PreviewIcon =
  | 'github'
  | 'linkedin'
  | 'mail'
  | 'download'
  | 'document'
  | 'recruiter'
  | 'external'
  | 'settings'
  | 'sound'
  | 'theme'
  | 'motion'
  | 'info'

/** What the right half of a split menu shows for the highlighted row. */
export type PreviewSpec =
  /** Classic 6G main-menu look: slowly panning (Ken Burns) cover art, cross-fading between covers. */
  | { type: 'slideshow'; artworks: ArtworkSpec[]; title: string; caption?: string }
  | { type: 'artwork'; artwork: ArtworkSpec; title?: string; caption?: string }
  | { type: 'project'; projectId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'profile' }
  | { type: 'info'; icon: PreviewIcon; title: string; detail?: string; hint?: string }
  | { type: 'setting'; setting: SettingKey }
  | { type: 'now-playing' }

/** Side effects a menu row can trigger instead of opening a screen. */
export type MenuAction =
  | { type: 'open-url'; href: string }
  | { type: 'download'; href: string; fileName: string }
  | { type: 'recruiter-view' }

/** Full-screen, non-menu views. Rendered via the registry in `screens/index.tsx`. */
export type ScreenSpec =
  | { type: 'project'; projectId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'about' }
  | { type: 'resume' }
  | { type: 'about-portfolio' }
  | { type: 'now-playing' }
  | { type: 'cover-flow' }

interface NodeBase {
  /** Globally unique, stable id (e.g. "projects/polly-debate-ai"). */
  id: string
  /** Row label in the parent menu. */
  label: string
  /** Split-view preview when this node is highlighted in a split menu. */
  preview?: PreviewSpec
  /** Only list this row while something is "playing" (iPod "Now Playing" row). */
  visibleWhen?: 'playing'
}

export interface MenuNode extends NodeBase {
  kind: 'menu'
  /** Status bar title while this menu is open. */
  title: string
  /** 'split' = classic 6G half menu + half preview; 'full' = full-width list. */
  layout: 'split' | 'full'
  children: IPodNode[]
}

export interface ScreenNode extends NodeBase {
  kind: 'screen'
  /** Status bar title while this screen is open. */
  title: string
  screen: ScreenSpec
}

export interface ActionNode extends NodeBase {
  kind: 'action'
  action: MenuAction
}

export interface SettingNode extends NodeBase {
  kind: 'setting'
  setting: SettingKey
}

export type IPodNode = MenuNode | ScreenNode | ActionNode | SettingNode

/** Nodes that occupy the whole LCD when opened. */
export type NavigableNode = MenuNode | ScreenNode

/* ────────────────────────────────────────────────────────────────────────────
 * Navigation state machine
 * ──────────────────────────────────────────────────────────────────────────── */

/** One level of history: which node is open and which row was highlighted. */
export interface MenuLevel {
  nodeId: string
  index: number
}

export interface NavigationState {
  /** Root first, current level last. Never empty. */
  history: MenuLevel[]
  /** Direction of the most recent transition: 1 = deeper (slide left), -1 = back (slide right). */
  direction: 1 | -1
}

export type NavigationAction =
  /** Move the highlight by `delta`, clamped to [0, count - 1] (no wrap — like the iPod). */
  | { type: 'move'; delta: number; count: number }
  | { type: 'set-index'; index: number; count: number }
  /** Open a menu/screen node one level deeper. Its index starts at 0. */
  | { type: 'push'; nodeId: string; index?: number }
  /** Go back one level, restoring that level's highlighted row. No-op at root. */
  | { type: 'pop' }
  /** Return to the root menu, keeping the root's highlighted row. */
  | { type: 'reset' }

/* ────────────────────────────────────────────────────────────────────────────
 * Screen ⇄ engine contract
 *
 * Whatever is on the LCD registers a controller so the engine (keyboard, click
 * wheel) knows how many positions it has and what "Select" means there.
 * Menus get a controller from the engine; full screens register their own.
 * ──────────────────────────────────────────────────────────────────────────── */

/** What moved the highlight: the wheel turning (clockwise = +1) or a key or slider step (↓ = +1). */
export type MoveSource = 'wheel' | 'key'

export interface ScreenController {
  /** Number of highlight/scroll positions. Moves clamp to [0, count - 1]. */
  count: number
  /** Select / Enter / → / centre button, with the current index. */
  onSelect?: (index: number) => void
  /**
   * Intercept wheel/arrow movement (e.g. volume on Now Playing). `delta` is in list
   * direction (+1 = next row) whatever the source. Return true when handled.
   */
  onMove?: (delta: number, source: MoveSource) => boolean
  /** Intercept the ⏮ / ⏭ wheel buttons (e.g. skip track). Return true when handled. */
  onSkip?: (delta: 1 | -1) => boolean
  /**
   * What the highlight at `index` is, in words ("Live Site, 2 of 3",
   * "UP! Investments, Oct 2025"). The engine speaks it through the device's single
   * live region and the wheel slider's aria-valuetext — screens must not keep
   * their own live regions. Return undefined for plain reading positions.
   * Re-read after every device update (navigation, settings, playback), so it may
   * depend on the screen's props and contexts but not on its local state.
   */
  describe?: (index: number) => string | undefined
}

/** Engine callbacks every screen receives. Stable across renders. */
export interface ScreenApi {
  /**
   * Register the active screen's controller. Returns an unregister function that
   * only clears the controller if it is still the registered one (so an exiting
   * screen can never clear the incoming screen's controller).
   * Prefer the `useScreenController` hook over calling this directly.
   */
  register: (controller: ScreenController) => () => void
  /**
   * Move the highlight without selecting. Clicks like a wheel step unless
   * `silent` (use silent for native scroll/touch sync so it doesn't chatter).
   */
  setIndex: (index: number, options?: { silent?: boolean }) => void
  /** Highlight a row and select it (pointer click on a row). */
  selectIndex: (index: number) => void
  /** Open a menu/screen node by id (one level deeper). */
  open: (nodeId: string) => void
  /** Activate a menu row: open menus/screens, run actions, toggle settings. */
  activate: (node: IPodNode) => void
  /** Run a side-effect action (links, downloads, Recruiter View). */
  runAction: (action: MenuAction) => void
  /** Play the mechanical click (respects the Sound setting). */
  click: () => void
}

/** Props every LCD screen component receives. */
export interface ScreenProps<N extends NavigableNode = NavigableNode> {
  node: N
  /** Highlighted index for this level. Frozen while the screen animates out. */
  index: number
  /** True for the current screen; false while animating out. Only active screens register controllers. */
  active: boolean
  api: ScreenApi
}
