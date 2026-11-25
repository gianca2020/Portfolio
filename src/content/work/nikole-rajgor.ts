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
      title: 'Explore widely, then narrow to what she wanted',
      why:
        'Because she was paying for a designer rather than a template, I didn’t start with one answer. We went through very different designs before narrowing toward what she wanted, which is also what made the Figma rounds quick: we were already on the same page creatively.\n\nIn the files that survive, the look moves from a stark white page with a bold sans-serif name, to a warm cream page with a serif masthead, to a full bio beside a photo with a dark section below.',
      media: {
        type: 'image',
        src: 'v2-about-band.webp',
        alt: 'Figma frame of the About page in the second direction: cream background, a serif NIKOLE RAJGOR masthead, a circular headshot overlapping a brown band, and the nav About, Journalism, Resume, Creative.',
      },
      caption: 'The second Figma direction: cream, serif and a circular headshot.',
    },
    {
      title: 'Make the name a newspaper masthead',
      why:
        'The journalism page opens like a front page: NIKOLE RAJGOR in wide-tracked Playfair Display serif, with JOURNALIST beneath it, on a dark charcoal background with cream text. It reads as a nameplate, which tells a visitor what she does before they read a word.\n\nThe serif arrived in the second Figma direction, replacing the bold sans-serif of the first.',
      media: {
        type: 'image',
        src: 'v1-about-hero.webp',
        alt: 'Figma frame of the first About direction: white background, a bold sans-serif NIKOLE RAJGOR, a gray image placeholder and the nav About, Journalism, Resume.',
      },
      caption: 'The first direction, before the serif masthead.',
    },
    {
      title: 'Give journalism and creative work separate homes',
      why:
        'Creative wasn’t in the first Figma direction, which had only About, Journalism and Resume. It became its own nav item in the second, and the third direction put a Highlights section on the About page with a Journalist / Creative toggle, so a visitor sees both sides of her work without leaving the page. Her highlighted articles made it into the build.',
      media: {
        type: 'image',
        src: 'v3-about-bio-highlights.webp',
        alt: 'Figma frame of the third About direction: a serif masthead, a headshot beside a five-paragraph bio, and below it a dark Highlights section with a Journalist and Creative toggle over a list of article cards.',
      },
      caption: 'The third direction: bio beside a photo, then dark Highlights. The headshot is a placeholder; she has since changed it.',
    },
    {
      title: 'Keep the design open while building',
      why:
        'She changed her mind as the build went on, so I made small redesigns along the way instead of treating Figma as final. The dark charcoal look of the shipped journalism page is closer to the finished site than any one Figma frame. The contact form in the designs was cut.',
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
  process: [
    {
      label: 'First direction: white and sans-serif',
      src: 'v1-about-hero.webp',
      alt: 'Figma frame of the first About direction: white background, a bold sans-serif NIKOLE RAJGOR, a gray image placeholder and a contact form.',
    },
    {
      label: 'Second direction: cream, serif and a circular headshot',
      src: 'v2-about-band.webp',
      alt: 'Figma frame of the second About direction: cream background, a serif NIKOLE RAJGOR masthead and a circular headshot over a brown band.',
    },
    {
      label: 'Third direction: bio and a Highlights section',
      src: 'v3-about-bio-highlights.webp',
      alt: 'Figma frame of the third About direction: a headshot beside a full bio, then a dark Highlights section with article cards.',
    },
    {
      label: 'Journalism page, still in the first direction',
      src: 'journalism.webp',
      alt: 'Figma frame of the Journalism page: white background, a gray image placeholder, a search bar and four article cards with mock text.',
    },
  ],
  finalDesign: {
    text: 'TODO',
    media: [],
  },
  links: [{ label: 'Visit nikolerajgor.netlify.app', href: 'https://nikolerajgor.netlify.app/' }],
  outcome:
    'Nikole was admitted to grad school and uses the site to promote her work.',
  reflection: 'TODO',
}
