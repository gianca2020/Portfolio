import { useMemo } from 'react'
import { findProject } from '../../data/portfolio'
import { projectBlocks } from './detail/blocks'
import { DetailView } from './DetailView'
import type { ScreenNode, ScreenProps } from './types'

/** Dedicated project page: cover, pitch, numbers, stack, highlights and links. */
export function ProjectDetail({ projectId, ...props }: ScreenProps<ScreenNode> & { projectId: string }) {
  const blocks = useMemo(() => projectBlocks(findProject(projectId)), [projectId])
  return <DetailView {...props} blocks={blocks} />
}
