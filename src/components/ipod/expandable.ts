import type { ScreenSpec } from './types'

/** Screens with something worth reading at full size; the rest (Cover Flow, Now Playing…) stay iPod-only. */
const EXPANDABLE: ReadonlySet<ScreenSpec['type']> = new Set(['project', 'experience', 'about', 'resume'])

export const canExpand = (spec: ScreenSpec): boolean => EXPANDABLE.has(spec.type)
