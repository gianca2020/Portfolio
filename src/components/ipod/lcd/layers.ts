/**
 * Layer bookkeeping for cross-fades: the newest layer fades in on top of the
 * previous ones, which stay put underneath until the fade completes.
 */
export interface Layer<T> {
  /** Identity of the content (what the caller keys on). */
  key: string
  /** Serial number, unique within the stack: a key that returns gets a fresh layer (and a fresh fade). */
  id: number
  value: T
  /** Fade in when mounted (false for the very first layer and under reduced motion). */
  fade: boolean
}

export const firstLayer = <T>(key: string, value: T): Layer<T>[] => [{ key, id: 0, value, fade: false }]

/**
 * Adds a layer for `key` on top, keeping at most `max` layers (oldest dropped).
 * Returns the same array when `key` is already on top.
 */
export function pushLayer<T>(layers: Layer<T>[], key: string, value: T, fade: boolean, max = 2): Layer<T>[] {
  const top = layers[layers.length - 1]
  if (top?.key === key) return layers
  const next = [...layers, { key, id: (top?.id ?? -1) + 1, value, fade }]
  return next.slice(Math.max(0, next.length - Math.max(1, max)))
}

/**
 * Once the top layer (`id`) has finished fading in, everything beneath it can
 * go, and it stops being a fade: a settled layer that kept its fade-in would
 * replay it whenever the LCD is shown again (e.g. back from Recruiter View).
 * Returns the same array when there is nothing to settle.
 */
export function settleLayers<T>(layers: Layer<T>[], id: number): Layer<T>[] {
  const top = layers[layers.length - 1]
  if (top?.id !== id || (layers.length === 1 && !top.fade)) return layers
  return [{ ...top, fade: false }]
}
