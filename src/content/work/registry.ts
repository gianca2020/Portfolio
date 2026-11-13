import { codeForAll } from './code-for-all.ts'
import { duels } from './duels.ts'
import { hackKnight } from './hackknight.ts'
import { puberry } from './puberry.ts'
import type { CaseStudy } from './types.ts'

/** Every case study, in the order they're listed. */
export const caseStudies: CaseStudy[] = [puberry, duels, codeForAll, hackKnight]

/** The ones visitors can see: routed, on the iPod and in /work. */
export const publishedCaseStudies = caseStudies.filter((c) => c.published)
