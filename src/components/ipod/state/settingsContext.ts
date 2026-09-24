import { createContext, useContext } from 'react'
import type { SettingKey } from '../types'

export type ChassisTheme = 'silver' | 'black'

export interface Settings {
  /** Click-wheel clicks. */
  sound: boolean
  /** Chassis finish — the two 6th-generation colours. */
  theme: ChassisTheme
  /** Explicit choice; `null` follows the OS `prefers-reduced-motion` setting. */
  reduceMotion: boolean | null
}

export interface SettingsValue {
  settings: Settings
  /** Effective reduced-motion preference (explicit choice, else the OS setting). */
  reducedMotion: boolean
  /** Cycle a setting to its next value (what selecting a Settings row does). */
  toggle: (key: SettingKey) => void
  /** Right-aligned value text for a Settings row, e.g. "On", "Silver". */
  describe: (key: SettingKey) => string
}

export const DEFAULT_SETTINGS: Settings = { sound: true, theme: 'silver', reduceMotion: null }

export const SettingsContext = createContext<SettingsValue | null>(null)

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used inside <SettingsProvider>')
  return value
}
