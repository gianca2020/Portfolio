import { portfolio } from '../../data/portfolio'
import { resumeBlocks } from './detail/blocks'
import { DetailView } from './DetailView'
import type { ScreenNode, ScreenProps } from './types'

const blocks = resumeBlocks(portfolio)

/** View Resume: the condensed résumé, readable one wheel step at a time. */
export function Resume(props: ScreenProps<ScreenNode>) {
  return <DetailView {...props} blocks={blocks} />
}
