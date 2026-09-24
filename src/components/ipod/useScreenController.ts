import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ScreenApi, ScreenController } from './types'

/**
 * Registers a full screen's controller with the engine while the screen is
 * active. Handlers may change every render (they always see fresh props);
 * the registration itself only refreshes when `active` or `count` changes.
 *
 *   useScreenController(api, active, {
 *     count: rows.length,
 *     onSelect: (i) => rows[i].run(),
 *   })
 */
export function useScreenController(api: ScreenApi, active: boolean, controller: ScreenController) {
  const latest = useRef(controller)
  useLayoutEffect(() => {
    latest.current = controller
  })

  const { count } = controller
  useEffect(() => {
    if (!active) return
    return api.register({
      count,
      onSelect: (index) => latest.current.onSelect?.(index),
      onMove: (delta, source) => latest.current.onMove?.(delta, source) ?? false,
      onSkip: (delta) => latest.current.onSkip?.(delta) ?? false,
      describe: (index) => latest.current.describe?.(index),
    })
  }, [api, active, count])
}
