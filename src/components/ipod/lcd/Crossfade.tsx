import { useState, type AnimationEvent, type ReactNode } from 'react'
import { useDeviceActive } from '../state/deviceContext'
import { firstLayer, pushLayer, settleLayers, type Layer } from './layers'

export interface CrossfadeProps<T> {
  /** Identity of what is shown; a new key dissolves in over the previous one. */
  itemKey: string
  /** Data for the current key. The top layer always renders the latest value. */
  value: T
  render: (value: T) => ReactNode
  durationMs: number
  /** Swap instantly (reduced motion). */
  instant?: boolean
}

/**
 * Stacks the previous and the current content, fading the current one in on
 * top (older layers stay opaque underneath, so there is no dip in brightness).
 * Layers fill their positioned parent. Swaps outright while the device is
 * hidden: nothing is painted then, so there is nothing to dissolve.
 */
export function Crossfade<T>({ itemKey, value, render, durationMs, instant = false }: CrossfadeProps<T>) {
  const deviceActive = useDeviceActive()
  const still = instant || !deviceActive
  const [layers, setLayers] = useState<Layer<T>[]>(() => firstLayer(itemKey, value))
  const top = layers[layers.length - 1]
  // Derived state: adjusted while rendering (React re-renders immediately).
  if (top.key !== itemKey) {
    // Three layers let a fast wheel spin stack fades without exposing the ground beneath.
    setLayers(pushLayer(layers, itemKey, value, !still, still ? 1 : 3))
  } else if (still) {
    // Settle fades cut short (Reduce Motion switched on, or the device hidden mid-dissolve,
    // which cancels the CSS animation) so they don't replay when motion comes back.
    const settled = settleLayers(layers, top.id)
    if (settled !== layers) setLayers(settled)
  }

  const onAnimationEnd = (id: number) => (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setLayers((prev) => settleLayers(prev, id))
  }

  const visible = still ? layers.slice(-1) : layers
  return (
    <>
      {visible.map((layer, i) => {
        const fading = layer.fade && !still
        const latest = i === visible.length - 1 && layer.key === itemKey
        return (
          <div
            key={layer.id}
            // Outgoing layers linger only for the dissolve; assistive tech reads just the current one.
            aria-hidden={latest ? undefined : true}
            className={`absolute inset-0 ${fading ? 'lcd-fade-in' : ''}`}
            style={fading ? { animationDuration: `${durationMs}ms` } : undefined}
            onAnimationEnd={fading ? onAnimationEnd(layer.id) : undefined}
          >
            {render(latest ? value : layer.value)}
          </div>
        )
      })}
    </>
  )
}
