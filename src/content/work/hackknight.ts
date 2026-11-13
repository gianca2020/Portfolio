import type { CaseStudy } from './types.ts'

/*
 * Draft. Only facts visible on hackknight.org are filled in; the design story
 * (problem, users, decisions, process, outcome) still needs writing. Flip
 * `published` to true once it reads as a full case study.
 */
export const hackKnight: CaseStudy = {
  slug: 'hackknight',
  published: false,
  title: 'HackKnight 2026',
  summary:
    'The website for HackKnight, a 48-hour student hackathon at Queens College – CUNY, designed and built by a team of three web developers.',
  cover: {
    type: 'image',
    src: 'site-desktop.webp',
    alt: 'HackKnight 2026 home page: “HackKnight 2026, October 9th – 11th, 2026, located at Queens College – CUNY” in purple and white over a dark castle landscape, with a countdown timer.',
  },
  snapshot: {
    role: 'Website Developer',
    team: 'Three website developers, alongside the HackKnight organizing team',
    timeline: 'TODO',
    tools: [],
    platforms: ['Web', 'Mobile web'],
    metrics: [],
  },
  problem: 'TODO',
  users: [],
  decisions: [],
  process: [],
  finalDesign: {
    text: 'TODO',
    media: [
      {
        type: 'image',
        src: 'site-desktop-full.webp',
        alt: 'The full HackKnight home page: hero, sponsors, past event highlights, event schedule, team, judges and FAQ.',
      },
      {
        type: 'image',
        src: 'site-mobile.webp',
        alt: 'The HackKnight home page on a phone, with the hero and countdown stacked in a single column.',
      },
    ],
  },
  links: [{ label: 'Visit hackknight.org', href: 'https://hackknight.org/' }],
  outcome: 'TODO',
  reflection: 'TODO',
}
