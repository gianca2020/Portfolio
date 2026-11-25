import type { CaseStudy } from './types.ts'

/*
 * Scaffolded from the Nikole-Rajgor and Nikole_privv repos and the planning
 * session. Unpublished until the admin v3 redesign ships. Every 'TODO' is
 * hidden on the page until it is filled in; media entries are added once the
 * assets exist in portfolio-assets/nikole-rajgor/ (run `npm run work:assets`).
 */
export const nikoleRajgor: CaseStudy = {
  slug: 'nikole-rajgor',
  published: false,
  title: 'Nikole Rajgor',
  summary:
    'A portfolio for a journalist applying to grad school: designed in Figma, built on a database she can update herself, with a private admin app I redesigned as I learned how she works.',
  snapshot: {
    role: 'Designer and developer. I designed the site in Figma and built both the public site and the admin app.',
    team: 'Me, with Nikole Rajgor as the client',
    timeline: 'Jan 2026 launch · Oct 2026 content-management phases · Nov 2026 admin redesign',
    tools: ['Figma', 'React', 'Tailwind CSS', 'Supabase', 'Netlify'],
    platforms: ['Web', 'Mobile web', 'Private admin app'],
    metrics: [
      { value: '4', label: 'public pages' },
      { value: '3', label: 'admin versions' },
    ],
  },
  problem:
    'Nikole is a journalist, and a coworker of mine at CUNY. She was applying to grad school and needed to look as professional as possible, with her clips, creative work and resume in one place.\n\nShe didn’t want a generic Squarespace site. She wanted a designer who could give her full creative control over the look and build something that could grow and be maintained, instead of a template that looks like everyone else’s.',
  users: [
    {
      name: 'Nikole, the editor',
      description:
        'Posts new articles and creative work, and keeps her bio, headshot and resume current. She isn’t a developer, so every task has to be possible without one.',
    },
    {
      name: 'Admissions readers and editors',
      description:
        'Visitors who skim quickly to judge her work. They need to find her clips and resume fast and come away trusting her.',
    },
  ],
  decisions: [
    {
      title: 'Build something custom, not a template',
      why: 'TODO',
    },
    {
      title: 'Make the name a newspaper masthead',
      why:
        'The journalism page opens like a front page: NIKOLE RAJGOR in wide-tracked Playfair Display serif, with JOURNALIST beneath it, on a dark charcoal background with cream text. It reads as a nameplate, which tells a visitor what she does before they read a word.',
    },
    {
      title: 'Give journalism and creative work separate homes',
      why: 'TODO',
    },
    {
      title: 'Keep her content in a database, not in the code',
      why:
        'Articles, creative pieces, her headshot, bio and resume all live in Supabase, so she can change any of them without a developer or a redeploy. The public site only reads that content.',
    },
    {
      title: 'Admin v1 to v2: from plain forms to a reporter’s memo journal',
      why: 'TODO',
    },
    {
      title: 'Admin v3',
      why: 'TODO',
    },
  ],
  process: [],
  finalDesign: {
    text: 'TODO',
    media: [],
  },
  links: [{ label: 'Visit nikolerajgor.netlify.app', href: 'https://nikolerajgor.netlify.app/' }],
  outcome:
    'Nikole was admitted to grad school and uses the site to promote her work.',
  reflection: 'TODO',
}
