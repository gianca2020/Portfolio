import { About } from './About'
import { AboutPortfolio } from './AboutPortfolio'
import { CoverFlow } from './CoverFlow'
import { ExperienceDetail } from './ExperienceDetail'
import { MenuScreen } from './Menu'
import { NowPlaying } from './NowPlaying'
import { ProjectDetail } from './ProjectDetail'
import { Resume } from './Resume'
import type { ScreenProps } from './types'

/**
 * Screen registry: maps a navigable node to the component that draws it.
 * Adding content (projects, roles) never touches this file; only a brand-new
 * *kind* of screen does.
 */
export function renderScreen(props: ScreenProps) {
  const { node } = props
  if (node.kind === 'menu') return <MenuScreen {...props} node={node} />

  const screenProps = { ...props, node }
  const spec = node.screen
  switch (spec.type) {
    case 'project':
      return <ProjectDetail {...screenProps} projectId={spec.projectId} />
    case 'experience':
      return <ExperienceDetail {...screenProps} experienceId={spec.experienceId} />
    case 'about':
      return <About {...screenProps} />
    case 'resume':
      return <Resume {...screenProps} />
    case 'about-portfolio':
      return <AboutPortfolio {...screenProps} />
    case 'now-playing':
      return <NowPlaying {...screenProps} />
    case 'cover-flow':
      return <CoverFlow {...screenProps} />
  }
}
