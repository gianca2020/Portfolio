import type { MenuLevel, NavigationAction, NavigationState } from './types'

/**
 * Pure navigation state machine.
 *
 * `history` is a stack of menu levels (root first). Each level remembers its own
 * highlighted row, so going back restores exactly where you were — like the
 * iPod. Drilling in always starts the new level at its first row.
 */

export const initialNavigation = (rootId: string): NavigationState => ({
  history: [{ nodeId: rootId, index: 0 }],
  direction: 1,
})

export const currentLevel = (state: NavigationState): MenuLevel => state.history[state.history.length - 1]

export const clampIndex = (index: number, count: number) =>
  count <= 0 ? 0 : Math.min(Math.max(index, 0), count - 1)

const withIndex = (state: NavigationState, index: number): NavigationState => {
  const level = currentLevel(state)
  if (level.index === index) return state
  return { ...state, history: [...state.history.slice(0, -1), { ...level, index }] }
}

export function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'move':
      return withIndex(state, clampIndex(currentLevel(state).index + action.delta, action.count))

    case 'set-index':
      return withIndex(state, clampIndex(action.index, action.count))

    case 'push': {
      // Guard against double activation (e.g. click + Enter in the same frame).
      if (currentLevel(state).nodeId === action.nodeId) return state
      return {
        history: [...state.history, { nodeId: action.nodeId, index: action.index ?? 0 }],
        direction: 1,
      }
    }

    case 'pop':
      if (state.history.length <= 1) return state
      return { history: state.history.slice(0, -1), direction: -1 }

    case 'reset':
      if (state.history.length <= 1) return state
      return { history: state.history.slice(0, 1), direction: -1 }
  }
}
