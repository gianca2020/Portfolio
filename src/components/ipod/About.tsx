import { portfolio } from '../../data/portfolio'
import { aboutBlocks } from './detail/blocks'
import { DetailView } from './DetailView'
import type { ScreenNode, ScreenProps } from './types'

const blocks = aboutBlocks(portfolio)

/** About Me, styled like an iPod information screen. */
export function About(props: ScreenProps<ScreenNode>) {
  return <DetailView {...props} blocks={blocks} />
}
