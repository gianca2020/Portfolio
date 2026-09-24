import { findExperience, findProject } from '../../data/portfolio'
import { Crossfade } from './lcd/Crossfade'
import { useLcdReducedMotion } from './lcd/hooks'
import { PREVIEW_FADE_MS } from './lcd/motion'
import { previewKey, SETTING_ICON } from './lcd/previewKey'
import { ExperienceCard, ProfileCard, ProjectCard } from './lcd/previews/CardPreviews'
import { CoverArt, NowPlayingArt, Slideshow } from './lcd/previews/CoverPreviews'
import { SlatePanel } from './lcd/previews/SlatePanel'
import { useSettings } from './state/settingsContext'
import type { PreviewSpec, SettingKey } from './types'
import './lcd.css'

export interface PreviewProps {
  spec: PreviewSpec | undefined
  /** Row label, shown on the fallback panel when there is nothing else to show. */
  label?: string
}

/** A setting's read-out: its glyph, the current value large, the row name beneath. */
function SettingReadout({ setting, label }: { setting: SettingKey; label?: string }) {
  const { describe } = useSettings()
  return <SlatePanel icon={SETTING_ICON[setting]} title={describe(setting)} titleMax={24} detail={label} />
}

function PreviewPanel({ spec, label = '' }: PreviewProps) {
  const fallback = <SlatePanel icon="info" title={label} />
  if (!spec) return fallback

  switch (spec.type) {
    case 'slideshow':
      return <Slideshow artworks={spec.artworks} title={spec.title} caption={spec.caption} />
    case 'artwork':
      return <CoverArt artwork={spec.artwork} title={spec.title} caption={spec.caption} />
    case 'project': {
      const project = findProject(spec.projectId)
      return project ? <ProjectCard project={project} /> : fallback
    }
    case 'experience': {
      const experience = findExperience(spec.experienceId)
      return experience ? <ExperienceCard experience={experience} /> : fallback
    }
    case 'profile':
      return <ProfileCard />
    case 'info':
      return <SlatePanel icon={spec.icon} title={spec.title} detail={spec.detail} hint={spec.hint} />
    case 'setting':
      return <SettingReadout setting={spec.setting} label={label} />
    case 'now-playing':
      return <NowPlayingArt />
    default:
      return fallback
  }
}

/**
 * Right half of a split menu (160 × 240, from the very top of the LCD): a
 * preview of the highlighted row. Follows the highlight immediately with a
 * very short dissolve (none under reduced motion).
 */
export function Preview({ spec, label }: PreviewProps) {
  const instant = useLcdReducedMotion()
  return (
    <div className="relative h-full w-full overflow-hidden bg-lcd font-ipod">
      <Crossfade
        itemKey={previewKey(spec, label)}
        value={{ spec, label }}
        durationMs={PREVIEW_FADE_MS}
        instant={instant}
        render={(props) => <PreviewPanel {...props} />}
      />
    </div>
  )
}
