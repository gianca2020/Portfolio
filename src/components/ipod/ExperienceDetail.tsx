import { useMemo } from 'react'
import { findExperience } from '../../data/portfolio'
import { experienceBlocks } from './detail/blocks'
import { DetailView } from './DetailView'
import type { ScreenNode, ScreenProps } from './types'

/** Dedicated role page: logo art, dates, numbers, highlights and stack. */
export function ExperienceDetail({ experienceId, ...props }: ScreenProps<ScreenNode> & { experienceId: string }) {
  const blocks = useMemo(() => experienceBlocks(findExperience(experienceId)), [experienceId])
  return <DetailView {...props} blocks={blocks} />
}
