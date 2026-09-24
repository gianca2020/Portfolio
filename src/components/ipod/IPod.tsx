import { MotionConfig } from 'framer-motion'
import { useState, type FocusEvent } from 'react'
import { Chassis } from './Chassis'
import { ClickWheel } from './ClickWheel'
import { menuTree, nodeIndex } from './data'
import { LCD } from './LCD'
import { ScreenStack } from './Screen'
import { StatusBar } from './StatusBar'
import { DeviceActiveContext } from './state/deviceContext'
import { initialLiveRegion, nextLiveRegion } from './state/liveRegion'
import { usePlayback } from './state/playbackContext'
import { useSettings } from './state/settingsContext'
import { useIPodEngine } from './useIPodEngine'

/**
 * The device: chassis + LCD + click wheel, wired to the navigation engine.
 * Must be rendered inside <SettingsProvider> and <PlaybackProvider>.
 */
export function IPod({ active }: { active: boolean }) {
  const { settings, reducedMotion } = useSettings()
  const playback = usePlayback()
  const engine = useIPodEngine({ root: menuTree, nodes: nodeIndex, enabled: active })
  const { controls } = engine
  const statusLayout = engine.node.kind === 'menu' && engine.node.layout === 'split' ? 'split' : 'full'

  // While the wheel slider has focus its aria-valuetext speaks each step, so the live
  // region stays quiet about navigation (see state/liveRegion.ts).
  const [sliderFocused, setSliderFocused] = useState(false)
  const trackSliderFocus = (event: FocusEvent<HTMLDivElement>) =>
    setSliderFocused(event.type === 'focus' && event.target.getAttribute('role') === 'slider')

  const [liveRegion, setLiveRegion] = useState(() => initialLiveRegion(engine.announcement, playback.status))
  const nextRegion = nextLiveRegion(liveRegion, {
    announcement: engine.announcement,
    status: playback.status,
    track: playback.track,
    sliderFocused,
  })
  // State derived from the previous render (React re-renders at once, before committing).
  if (nextRegion !== liveRegion) setLiveRegion(nextRegion)

  return (
    <DeviceActiveContext.Provider value={active}>
      <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
        <Chassis
          theme={settings.theme}
          screen={
            <LCD>
              {/* The stack spans the whole LCD: in split view the preview panel runs
                  full height while the status bar covers only the left half. */}
              <ScreenStack
                node={engine.node}
                index={engine.index}
                depth={engine.depth}
                direction={engine.direction}
                api={engine.api}
              />
              <StatusBar title={engine.node.title} playback={playback.status} layout={statusLayout} />
            </LCD>
          }
          wheel={
            <div className="contents" onFocus={trackSliderFocus} onBlur={trackSliderFocus}>
              <ClickWheel
                theme={settings.theme}
                onRotate={controls.moveBy}
                onMenu={controls.back}
                onSelect={controls.select}
                onPrevious={() => controls.skip(-1)}
                onNext={() => controls.skip(1)}
                onPlayPause={controls.playPause}
                playing={playback.status === 'playing'}
                a11y={engine.wheel}
              />
            </div>
          }
        />
        <p aria-live="polite" aria-atomic="true" className="sr-only">
          {nextRegion.text}
        </p>
      </MotionConfig>
    </DeviceActiveContext.Provider>
  )
}
