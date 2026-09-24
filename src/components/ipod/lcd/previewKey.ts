import type { PreviewIcon, PreviewSpec, SettingKey } from '../types'

/**
 * Identity of what a split-view preview shows. The panel cross-fades only when
 * this changes, so live values (a setting being toggled, the current track)
 * update in place instead of flickering.
 */
export function previewKey(spec: PreviewSpec | undefined, label = ''): string {
  if (!spec) return `none:${label}`
  switch (spec.type) {
    case 'slideshow':
      return `slideshow:${spec.title}`
    case 'artwork':
      return `artwork:${spec.title ?? ''}:${spec.artwork.monogram}:${spec.artwork.image ?? ''}`
    case 'project':
      return `project:${spec.projectId}`
    case 'experience':
      return `experience:${spec.experienceId}`
    case 'profile':
      return 'profile'
    case 'info':
      return `info:${spec.icon}:${spec.title}`
    case 'setting':
      return `setting:${spec.setting}`
    case 'now-playing':
      return 'now-playing'
  }
}

/** Glyph drawn on a setting's read-out panel. */
export const SETTING_ICON: Record<SettingKey, PreviewIcon> = {
  sound: 'sound',
  theme: 'theme',
  reduceMotion: 'motion',
}
