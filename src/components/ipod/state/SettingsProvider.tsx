import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { soundEngine } from '../SoundEngine'
import type { SettingKey } from '../types'
import { DEFAULT_SETTINGS, SettingsContext, type Settings, type SettingsValue } from './settingsContext'

const STORAGE_KEY = 'gf-ipod-portfolio:settings'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      sound: typeof parsed.sound === 'boolean' ? parsed.sound : DEFAULT_SETTINGS.sound,
      theme: parsed.theme === 'black' || parsed.theme === 'silver' ? parsed.theme : DEFAULT_SETTINGS.theme,
      reduceMotion: typeof parsed.reduceMotion === 'boolean' ? parsed.reduceMotion : null,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: Settings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Private mode / blocked storage: settings simply don't persist.
  }
}

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const systemReducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false)
  const reducedMotion = settings.reduceMotion ?? systemReducedMotion

  useEffect(() => saveSettings(settings), [settings])
  useEffect(() => soundEngine.setMuted(!settings.sound), [settings.sound])

  const toggle = useCallback(
    (key: SettingKey) => {
      setSettings((prev) => {
        switch (key) {
          case 'sound':
            return { ...prev, sound: !prev.sound }
          case 'theme':
            return { ...prev, theme: prev.theme === 'silver' ? 'black' : 'silver' }
          case 'reduceMotion':
            return { ...prev, reduceMotion: !(prev.reduceMotion ?? systemReducedMotion) }
        }
      })
    },
    [systemReducedMotion],
  )

  const describe = useCallback(
    (key: SettingKey) => {
      switch (key) {
        case 'sound':
          return settings.sound ? 'On' : 'Off'
        case 'theme':
          return settings.theme === 'silver' ? 'Silver' : 'Black'
        case 'reduceMotion':
          return reducedMotion ? 'On' : 'Off'
      }
    },
    [settings, reducedMotion],
  )

  const value = useMemo<SettingsValue>(
    () => ({ settings, reducedMotion, toggle, describe }),
    [settings, reducedMotion, toggle, describe],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
