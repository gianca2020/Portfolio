import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ClickWheel } from '../ClickWheel'
import type { WheelA11y } from '../useIPodEngine'

const noop = () => {}

const wheel = (a11y: WheelA11y, playing = false) =>
  renderToStaticMarkup(
    <ClickWheel
      theme="silver"
      onRotate={noop}
      onMenu={noop}
      onSelect={noop}
      onPrevious={noop}
      onNext={noop}
      onPlayPause={noop}
      playing={playing}
      a11y={a11y}
    />,
  )

function slider(a11y: WheelA11y) {
  const tag = wheel(a11y).match(/<div[^>]*role="slider"[^>]*>/)?.[0] ?? ''
  const attr = (name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1]
  return { tag, attr }
}

describe('ClickWheel slider', () => {
  it('is a focusable vertical slider, so AT increment / decrement arrive as ↑ / ↓', () => {
    const { tag, attr } = slider({ label: 'Click wheel', valueText: 'Projects, submenu, 1 of 7', index: 0, count: 7 })
    expect(tag).not.toBe('')
    expect(attr('aria-orientation')).toBe('vertical')
    expect(attr('tabindex')).toBe('0')
    expect(attr('aria-label')).toBe('Click wheel')
    expect(attr('aria-valuetext')).toBe('Projects, submenu, 1 of 7')
  })

  it('puts its maximum at the top row', () => {
    const top = slider({ label: 'Click wheel', valueText: '', index: 0, count: 7 })
    expect([top.attr('aria-valuemin'), top.attr('aria-valuemax'), top.attr('aria-valuenow')]).toEqual(['1', '7', '7'])
    expect(slider({ label: 'Click wheel', valueText: '', index: 6, count: 7 }).attr('aria-valuenow')).toBe('1')
  })
})

describe('ClickWheel keys', () => {
  const a11y: WheelA11y = { label: 'Click wheel', valueText: '', index: 0, count: 1 }

  it('names the play key by what it does next', () => {
    expect(wheel(a11y, false)).toContain('aria-label="Play"')
    expect(wheel(a11y, true)).toContain('aria-label="Pause"')
    expect(wheel(a11y, true)).not.toContain('aria-pressed')
  })
})
