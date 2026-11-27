import { artic } from './artic.ts'
import { codeForAll } from './code-for-all.ts'
import { duels } from './duels.ts'
import { hackKnight } from './hackknight.ts'
import { littlePhotoClub } from './little-photo-club.ts'
import { puberry } from './puberry.ts'
import type { CaseStudy } from './types.ts'

// Placement on the work index also determines which studies get their own iPod row.
const featured: CaseStudy[] = [puberry, duels, codeForAll, artic, hackKnight]
const moreDesign: CaseStudy[] = [littlePhotoClub]

export const caseStudies = [...featured, ...moreDesign]
export const featuredCaseStudies = featured.filter((study) => study.published)
export const moreDesignCaseStudies = moreDesign.filter((study) => study.published)
export const publishedCaseStudies = [...featuredCaseStudies, ...moreDesignCaseStudies]
