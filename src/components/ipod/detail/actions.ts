import type { MenuAction } from '../types'
import type { ActionBlock } from './types'

/** Where an action row takes you when that is off the iPod, e.g. "opens in a new tab". */
export function actionHint(action: MenuAction): string | undefined {
  if (action.type !== 'open-url') return undefined
  return action.href.startsWith('mailto:') ? 'opens your mail app' : 'opens in a new tab'
}

/** Spoken words for action row `row` ("GitHub, opens in a new tab, 1 of 3"); undefined when no row is highlighted. */
export function describeActionRow(actions: ActionBlock[], row: number): string | undefined {
  const block = actions[row]
  if (!block) return undefined
  const hint = actionHint(block.action)
  return `${block.label}${hint ? `, ${hint}` : ''}, ${row + 1} of ${actions.length}`
}
