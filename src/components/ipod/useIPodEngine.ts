import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { getVisibleChildren, isNavigable } from './data'
import { clampIndex, currentLevel, initialNavigation, navigationReducer } from './navigation'
import { soundEngine } from './SoundEngine'
import { usePlayback } from './state/playbackContext'
import { useSettings } from './state/settingsContext'
import type {
  IPodNode,
  MenuAction,
  MenuLevel,
  MenuNode,
  MoveSource,
  NavigableNode,
  NavigationAction,
  NavigationState,
  ScreenApi,
  ScreenController,
  SettingKey,
} from './types'

/** Input surface shared by the keyboard handler and the click wheel. */
export interface IPodControls {
  /** Rotate / arrow: +1 = next row (clockwise, ↓), -1 = previous row. `source` defaults to the wheel. */
  moveBy: (delta: number, source?: MoveSource) => void
  select: () => void
  back: () => void
  /** ⏮ / ⏭ buttons: screen-specific (skip track) or previous/next row. */
  skip: (delta: 1 | -1) => void
  playPause: () => void
  home: () => void
}

export interface WheelA11y {
  /** Accessible name of the wheel slider. */
  label: string
  /** Spoken value: the highlighted row, or the open screen's position. */
  valueText: string
  index: number
  count: number
}

export interface IPodEngine {
  history: MenuLevel[]
  direction: 1 | -1
  /** Node currently on the LCD. */
  node: NavigableNode
  /** Nesting depth of `node` (root = 0). */
  depth: number
  /** Highlighted index of the current level (clamped). */
  index: number
  api: ScreenApi
  controls: IPodControls
  wheel: WheelA11y
  /** Polite live-region text describing the current highlight. */
  announcement: string
}

interface Registration extends Pick<ScreenController, 'count' | 'describe'> {
  nodeId: string
}

interface EngineOptions {
  root: MenuNode
  nodes: Map<string, IPodNode>
  /** Keyboard shortcuts are only bound while enabled (off while Recruiter View is shown). */
  enabled: boolean
}

/** Screens don't notify changes to their description: it is re-read after each device update. */
const noSubscription = () => () => {}

const isTextInput = (el: Element | null) =>
  !!el && ((el instanceof HTMLElement && el.isContentEditable) || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

/** Controls the browser activates on Enter. */
const activatesOnEnter = (el: Element | null) => !!el?.closest('button, a[href], [role="button"], summary')
/** Controls the browser activates on Space. Links are not among them: Space would only scroll. */
const activatesOnSpace = (el: Element | null) => !!el?.closest('button, [role="button"], summary')

type KeyCommand = 'up' | 'down' | 'select' | 'back' | 'play-pause' | 'home'

interface KeyPress {
  key: string
  /** OS auto-repeat of a held key. */
  repeat: boolean
  /** Focus is on a control that Enter activates natively. */
  enterActivates: boolean
  /** Focus is on a control that Space activates natively. */
  spaceActivates: boolean
}

/** Keys that run a one-shot command, so holding them must not run it again. */
const ONE_SHOT_KEYS = new Set(['Enter', 'ArrowRight', ' ', 'Home'])

/**
 * Keyboard map: ↑ ↓ move · Enter / → select · ← / Esc back · Space play/pause · Home root.
 * Returns the command to run, 'swallow' to only prevent the browser default, or null to
 * leave the key to the browser (a focused button or link activating itself).
 */
export function keyCommand({ key, repeat, enterActivates, spaceActivates }: KeyPress): KeyCommand | 'swallow' | null {
  // Held one-shot keys would drill through menus, flip settings back and forth and
  // re-run downloads. Swallowing the repeat also keeps a focused button or link from
  // re-activating natively. ↑ ↓ ← Esc keep repeating: they only move through the tree.
  if (repeat && ONE_SHOT_KEYS.has(key)) return 'swallow'
  switch (key) {
    case 'ArrowUp':
      return 'up'
    case 'ArrowDown':
      return 'down'
    case 'ArrowRight':
      return 'select'
    case 'Enter':
      return enterActivates ? null : 'select'
    case 'ArrowLeft':
    case 'Escape':
      return 'back'
    case ' ':
      return spaceActivates ? null : 'play-pause'
    case 'Home':
      return 'home'
    default:
      return null
  }
}

/** Spoken form of a menu row: its label plus a setting's value or what selecting it opens. */
function describeRow(row: IPodNode, settingValue: (key: SettingKey) => string): string {
  switch (row.kind) {
    case 'setting':
      return `${row.label}, ${settingValue(row.setting)}`
    case 'menu':
      return `${row.label}, submenu`
    case 'screen':
      return `${row.label}, opens page`
    case 'action':
      return row.label
  }
}

interface SpokenInput {
  node: NavigableNode
  /** Highlighted row of a menu (undefined on screens and empty menus). */
  highlighted: IPodNode | undefined
  index: number
  count: number
  /** What the open screen says about `index`, if anything. */
  screenDescription: string | undefined
  settingValue: (key: SettingKey) => string
}

/**
 * Words for the current highlight: `valueText` for the wheel slider's aria-valuetext
 * (spoken while it has focus) and `announcement` for the device's live region
 * (spoken otherwise). Both always name the open menu or screen: menus add the row
 * and its position; screens add what their controller describes, else just their
 * position.
 */
export function spokenState({ node, highlighted, index, count, screenDescription, settingValue }: SpokenInput) {
  if (node.kind === 'menu') {
    if (!highlighted) return { valueText: node.title, announcement: node.title }
    const row = describeRow(highlighted, settingValue)
    return {
      valueText: `${row}, ${index + 1} of ${count}, ${node.title}`,
      announcement: `${node.title}: ${row}, ${index + 1} of ${count}`,
    }
  }
  if (screenDescription) {
    return { valueText: `${screenDescription}, ${node.title}`, announcement: `${node.title}: ${screenDescription}` }
  }
  return {
    valueText: count > 1 ? `${node.title}, position ${index + 1} of ${count}` : node.title,
    announcement: node.title,
  }
}

export function runMenuAction(action: MenuAction) {
  switch (action.type) {
    case 'open-url':
      if (action.href.startsWith('mailto:')) window.location.href = action.href
      else window.open(action.href, '_blank', 'noopener,noreferrer')
      return
    case 'download': {
      const link = document.createElement('a')
      link.href = action.href
      link.download = action.fileName
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
      return
    }
    case 'recruiter-view':
      window.location.hash = '/recruiter'
      return
  }
}

export function useIPodEngine({ root, nodes, enabled }: EngineOptions): IPodEngine {
  const settings = useSettings()
  const playback = usePlayback()

  const [nav, setNav] = useState<NavigationState>(() => initialNavigation(root.id))
  const navRef = useRef(nav)
  const settingsRef = useRef(settings)
  const playbackRef = useRef(playback)
  useLayoutEffect(() => {
    settingsRef.current = settings
    playbackRef.current = playback
  })

  const screenController = useRef<ScreenController | null>(null)
  /** What the active screen reported (count, describe), tagged with the node that registered it. */
  const [registration, setRegistration] = useState<Registration | null>(null)

  /* Everything below reads live state through refs so `api` and `controls`
   * keep a stable identity for the lifetime of the device. */
  const { api, controls } = useMemo(() => {
    const dispatch = (action: NavigationAction) => {
      const next = navigationReducer(navRef.current, action)
      if (next !== navRef.current) {
        navRef.current = next
        setNav(next)
      }
      return next
    }

    const nodeAt = (level: MenuLevel): NavigableNode => {
      const node = nodes.get(level.nodeId)
      return isNavigable(node) ? node : root
    }

    const activeController = (): ScreenController | null => {
      const node = nodeAt(currentLevel(navRef.current))
      if (node.kind === 'menu') {
        const items = getVisibleChildren(node, playbackRef.current.started)
        return { count: items.length, onSelect: (i) => items[i] && activate(items[i]) }
      }
      return screenController.current
    }

    const open = (nodeId: string) => {
      if (!isNavigable(nodes.get(nodeId))) return
      const before = navRef.current
      if (dispatch({ type: 'push', nodeId }) !== before) soundEngine.press()
    }

    const runAction = (action: MenuAction) => {
      soundEngine.press()
      runMenuAction(action)
    }

    function activate(node: IPodNode) {
      switch (node.kind) {
        case 'menu':
        case 'screen':
          open(node.id)
          return
        case 'action':
          runAction(node.action)
          return
        case 'setting':
          soundEngine.press()
          settingsRef.current.toggle(node.setting)
          return
      }
    }

    const setIndex = (index: number, options?: { silent?: boolean }) => {
      const controller = activeController()
      if (!controller) return
      const before = currentLevel(navRef.current).index
      const next = dispatch({ type: 'set-index', index, count: controller.count })
      if (currentLevel(next).index !== before && !options?.silent) soundEngine.click()
    }

    const select = () => {
      const controller = activeController()
      if (!controller?.onSelect || controller.count === 0) return
      controller.onSelect(clampIndex(currentLevel(navRef.current).index, controller.count))
    }

    const moveBy = (delta: number, source: MoveSource = 'wheel') => {
      const controller = activeController()
      if (!controller || delta === 0) return
      if (controller.onMove?.(delta, source)) return
      const before = currentLevel(navRef.current).index
      const next = dispatch({ type: 'move', delta, count: controller.count })
      if (currentLevel(next).index !== before) soundEngine.click()
    }

    const api: ScreenApi = {
      register: (controller) => {
        screenController.current = controller
        const { count, describe } = controller
        setRegistration({ nodeId: currentLevel(navRef.current).nodeId, count, describe })
        return () => {
          if (screenController.current === controller) screenController.current = null
        }
      },
      setIndex,
      // Silent move: the select's press is the feedback (a click just before it would
      // also swallow the press, which plays too soon after it).
      selectIndex: (index) => {
        setIndex(index, { silent: true })
        select()
      },
      open,
      activate,
      runAction,
      click: () => soundEngine.click(),
    }

    const controls: IPodControls = {
      moveBy,
      select,
      back: () => {
        const before = navRef.current
        if (dispatch({ type: 'pop' }) !== before) soundEngine.press()
      },
      skip: (delta) => {
        if (activeController()?.onSkip?.(delta)) soundEngine.press()
        else moveBy(delta)
      },
      playPause: () => {
        soundEngine.press()
        playbackRef.current.toggle()
      },
      home: () => {
        const before = navRef.current
        if (dispatch({ type: 'reset' }) !== before) soundEngine.press()
      },
    }

    return { api, controls }
  }, [nodes, root])

  // Unlock Web Audio on the first user gesture (autoplay policy).
  useEffect(() => {
    const unlock = () => soundEngine.unlock()
    const opts = { capture: true, passive: true } as const
    window.addEventListener('pointerdown', unlock, opts)
    window.addEventListener('keydown', unlock, opts)
    return () => {
      window.removeEventListener('pointerdown', unlock, opts)
      window.removeEventListener('keydown', unlock, opts)
    }
  }, [])

  // Keyboard shortcuts (see keyCommand); off while Recruiter View is shown.
  useEffect(() => {
    if (!enabled) return
    const run: Record<KeyCommand, () => void> = {
      up: () => controls.moveBy(-1, 'key'),
      down: () => controls.moveBy(1, 'key'),
      select: controls.select,
      back: controls.back,
      'play-pause': controls.playPause,
      home: controls.home,
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target instanceof Element ? event.target : null
      if (isTextInput(target)) return
      const command = keyCommand({
        key: event.key,
        repeat: event.repeat,
        enterActivates: activatesOnEnter(target),
        spaceActivates: activatesOnSpace(target),
      })
      if (command === null) return
      event.preventDefault()
      if (command !== 'swallow') run[command]()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, controls])

  // ── Derived view state ────────────────────────────────────────────────────
  const level = currentLevel(nav)
  const found = nodes.get(level.nodeId)
  const node: NavigableNode = isNavigable(found) ? found : root
  const items = node.kind === 'menu' ? getVisibleChildren(node, playback.started) : []
  // A screen's registration is only trusted once that screen has made it; until then
  // (first frame after a push/pop) pass its stored index through unclamped.
  const registered = registration?.nodeId === node.id ? registration : null
  const count = node.kind === 'menu' ? items.length : (registered?.count ?? 0)
  const index = node.kind === 'menu' || registered ? clampIndex(level.index, count) : level.index

  // A screen describes itself from its latest render, which commits only after this hook
  // has rendered (e.g. Now Playing's new track). Read it as an external store: React
  // re-reads the snapshot once the update has committed and re-renders if it changed.
  const describeScreen = node.kind === 'screen' ? registered?.describe : undefined
  const readDescription = () => describeScreen?.(index) || undefined
  const screenDescription = useSyncExternalStore(noSubscription, readDescription, readDescription)

  const { valueText, announcement } = spokenState({
    node,
    highlighted: items[index],
    index,
    count,
    screenDescription,
    settingValue: settings.describe,
  })

  return {
    history: nav.history,
    direction: nav.direction,
    node,
    depth: nav.history.length - 1,
    index,
    api,
    controls,
    wheel: { label: 'Click wheel — rotate or use arrow keys to scroll', valueText, index, count },
    announcement,
  }
}
