import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import './chassis.css'
import { DEVICE_MM, LCD_HEIGHT, LCD_WIDTH } from './constants'

const mm = (n: number) => `calc(var(--u) * ${Math.round(n * 1000) / 1000})`

const { window: glass, lcd } = DEVICE_MM

const GLASS_STYLE = { '--glass-radius': mm(glass.radius) } as CSSProperties
/** The lit panel sits centred behind the glass with a ≈1.05 mm black border. */
const LIT_STYLE: CSSProperties = {
  left: mm((glass.width - lcd.width) / 2),
  top: mm((glass.height - lcd.height) / 2),
  width: mm(lcd.width),
  height: mm(lcd.height),
}
const CANVAS_STYLE: CSSProperties = { width: LCD_WIDTH, height: LCD_HEIGHT }
/** `text-lcd-ink` so LCD text never inherits the stage's ink (near-white on the black finish). */
const CANVAS_CLASS = 'ipod-lcd__canvas relative overflow-hidden bg-lcd font-ipod text-lcd-ink select-none'

/**
 * The black glass window and the display behind it. Children render on a fixed
 * 320 × 240 CSS-px canvas (the real panel's pixel grid) scaled to fill the lit area.
 */
export function LCD({ children }: { children: ReactNode }) {
  const litRef = useRef<HTMLDivElement>(null)

  // Measured before first paint (no flash), then kept in sync. Written straight to a CSS variable so
  // resizing never re-renders the screen tree.
  useLayoutEffect(() => {
    const lit = litRef.current
    if (!lit) return
    const fit = (width: number) => {
      if (width > 0) lit.style.setProperty('--lcd-scale', String(width / LCD_WIDTH))
    }
    fit(lit.getBoundingClientRect().width)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => fit(entry.contentRect.width))
    observer.observe(lit)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="ipod-lcd" style={GLASS_STYLE}>
      <div ref={litRef} className="ipod-lcd__lit" style={LIT_STYLE}>
        <div className={CANVAS_CLASS} style={CANVAS_STYLE}>
          {children}
        </div>
      </div>
      <div className="ipod-lcd__glass" aria-hidden="true" />
    </div>
  )
}
