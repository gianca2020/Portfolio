import { createContext, useContext } from 'react'
import type { SettingKey } from '../types'

export type ChassisTheme = 'silver' | 'black' | 'pink'

/** The finishes Settings › Theme cycles through, in order. */
export const CHASSIS_THEMES: ChassisTheme[] = ['silver', 'black', 'pink']

const THEME_LABELS: Record<ChassisTheme, string> = { silver: 'Silver', black: 'Black', pink: 'Pink' }

/** The finish selected after this one — selecting Theme steps through CHASSIS_THEMES and wraps. */
export const nextTheme = (theme: ChassisTheme): ChassisTheme =>
  CHASSIS_THEMES[(CHASSIS_THEMES.indexOf(theme) + 1) % CHASSIS_THEMES.length]

/** Right-aligned label for a finish, e.g. "Silver", "Pink". */
export const themeLabel = (theme: ChassisTheme): string => THEME_LABELS[theme]

/** Parse a persisted finish, falling back to the default for anything unknown. */
export const parseTheme = (value: unknown): ChassisTheme =>
  CHASSIS_THEMES.includes(value as ChassisTheme) ? (value as ChassisTheme) : 'silver'

export interface Settings {
  /** Click-wheel clicks. */
  sound: boolean
  /** Chassis finish — the three 6th-generation colours. */
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
