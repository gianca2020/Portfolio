import { portfolio } from '../../data/portfolio'
import { aboutPortfolioBlocks } from './detail/blocks'
import { DetailView } from './DetailView'
import type { ScreenNode, ScreenProps } from './types'

const blocks = aboutPortfolioBlocks(portfolio)

/** Settings › About This Portfolio, laid out like the iPod's Settings › About. */
export function AboutPortfolio(props: ScreenProps<ScreenNode>) {
  return <DetailView {...props} blocks={blocks} />
}
