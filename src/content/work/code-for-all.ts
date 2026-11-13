import type { CaseStudy } from './types.ts'

/*
 * Drafted from the Code For All Brand Guidelines v1.1 (portfolio-assets/
 * code-for-all/brand-guide.pdf). Every 'TODO' is hidden on the page until it
 * is filled in; review the drafted copy for voice and accuracy.
 */
export const codeForAll: CaseStudy = {
  slug: 'code-for-all',
  published: true,
  title: 'Code For All',
  summary:
    'A brand identity for Code For All, a student coding club: a friendly mascot named Cody, a logo system that scales from merch down to a 16px favicon, and a guide any member can design from.',
  cover: {
    type: 'image',
    src: 'cover.webp',
    alt: 'Cover of the Code For All Brand Guidelines: the club name in bold geometric type on a purple background, with Cody, the mascot, at a laptop in the corner.',
  },
  snapshot: {
    role: 'TODO',
    team: 'TODO',
    timeline: 'TODO',
    tools: ['Affinity'],
    platforms: ['Social media', 'Discord', 'Print & merch', 'Web'],
    metrics: [
      { value: '5', label: 'logo lockups' },
      { value: '10', label: 'Cody variations' },
      { value: '12', label: 'brand colors' },
      { value: '3', label: 'typefaces' },
    ],
  },
  problem:
    'Code For All exists to help students of all backgrounds excel in their problem-solving and coding classes, in a supportive and inclusive environment. Its original logo was a dark, anonymous silhouette at a monitor, and it didn’t look like the welcoming club it represented.\n\nMembers make the club’s posters, social graphics, digital content and merch themselves. Without shared rules those pieces don’t look like they belong together, and the club misses out on the recognition that consistency builds.',
  users: [
    {
      name: 'Club members who design',
      description:
        'Current and future members making posters, graphics, digital content and merch. They need clear, reusable rules they can follow on their own.',
    },
    {
      name: 'Students of all backgrounds',
      description:
        'The people the club is for. The brand has to read as friendly and approachable to beginners, not intimidating.',
    },
  ],
  decisions: [
    {
      title: 'Replace the anonymous silhouette with a mascot',
      why:
        'The new logo replaces the faceless figure with Cody, a friendly character working on a laptop, framed by a vibrant purple circle. Bold outlines and the custom </> symbol on the laptop keep the technical identity, while Cody’s rounded shapes and welcoming expression carry the approachability at the heart of the club.\n\nThe circular frame and the “person coding” idea stay from the original, so the change feels like an evolution rather than a break.',
      media: {
        type: 'image',
        src: 'logo-before-after.webp',
        alt: 'Brand guide page comparing the old logo, a grayscale silhouette behind a monitor, with the new logo: Cody at a laptop inside a purple ring reading “Code For All”.',
      },
      caption: 'Old logo (left) and new logo (right).',
    },
    {
      title: 'Let Cody change with the calendar',
      why:
        'A static mascot gets stale. Cody can be dressed up for events and holidays, with a Santa hat in December, a pumpkin for Halloween, headphones for a music workshop or a trophy for hackathon winners, which keeps the brand feeling alive and gives members something to look forward to.\n\nA core set of expressions (default, waving, happy, surprised, crying and competitive) doubles as custom Discord emoji, stickers and reaction graphics.',
      media: {
        type: 'image',
        src: 'cody-variations.webp',
        alt: 'Grid of ten Cody illustrations: Santa, pumpkin, default, happy, competitive, headphones, trophy, waving, surprised and crying, each with a laptop in a different accent color.',
      },
      caption: 'Holiday, event and expression variations of Cody.',
    },
    {
      title: 'Design a lockup for every space',
      why:
        'One logo can’t fit a T-shirt, a navigation bar and a sticker. The system has five lockups: the full Primary badge for hero sections and merch, Vertical for square and tall formats, Horizontal for wide, narrow spaces like nav bars and email headers, Compact for avatars and stickers, and a Wordmark for when the logo is already established on the page.',
      media: {
        type: 'image',
        src: 'logo-variations.webp',
        alt: 'Brand guide page showing the five logo lockups: Primary badge, Vertical, Horizontal, Compact and Wordmark, with usage notes for each.',
      },
      caption: 'Primary, Vertical, Horizontal, Compact and Wordmark.',
    },
    {
      title: 'Redraw the favicon at each size instead of shrinking it',
      why:
        'Scaling the full logo down turns it into a smudge. The favicon puts Cody inside a rounded square and progressively removes detail as it gets smaller, so the mascot stays recognizable even at 16 pixels. Outlined versions cover light backgrounds where the filled Cody would lose contrast.',
      media: {
        type: 'image',
        src: 'favicon-scale.webp',
        alt: 'Brand guide page showing outlined logo versions and the favicon at 128, 64, 32 and 16 pixels, simplified at each step, plus Cody in four accent colors.',
      },
      caption: 'The favicon at 128, 64, 32 and 16px, plus outlined and accent versions.',
    },
    {
      title: 'Give every color and typeface one job',
      why:
        'Three fonts, three roles: Orbitron brings the logo’s geometric energy to headings, Lexend keeps body text readable on dark backgrounds, and JetBrains Mono gives technical details a code-native feel.\n\nThe palette works the same way. Ultraviolet is the primary brand color, with Deep Violet for hover and active states and Lavender Glow for soft accents. Five neutrals, from Void to White, build a dark canvas, and four accents each own a meaning, such as Cyber Teal for success and links and Signal Gold for warnings and Hack Knight branding.',
      media: {
        type: 'image',
        src: 'type-and-color.webp',
        alt: 'Two brand guide pages side by side: the color palette with core purples, neutrals and accent swatches, and the typography page with Orbitron, Lexend and JetBrains Mono specimens.',
      },
      caption: 'Color palette and typography pages.',
    },
  ],
  process: [
    {
      label: 'Starting point: the original logo',
      src: 'old-logo.webp',
      alt: 'The original Code For All logo: a grayscale silhouette of a person behind a monitor showing a </> symbol, inside a dark circle.',
    },
  ],
  finalDesign: {
    text:
      'The guide closes by putting the system to work. Buttons, badges, workshop cards and a leaderboard all follow the same rules: Orbitron for headings, Lexend for body text, JetBrains Mono for technical details, rounded corners and the brand palette. Members use them as a reference when building pages or designing graphics.',
    media: [
      {
        type: 'image',
        src: 'in-practice.webp',
        alt: 'Brand guide page of example components on a dark background: purple and gold buttons and badges, workshop and Hack Knight event cards, and a CFA leaderboard.',
      },
      {
        type: 'image',
        src: 'guidelines-spread.webp',
        alt: 'Three brand guide pages side by side: logo variations, color palette and typography.',
      },
    ],
  },
  links: [],
  outcome: 'TODO',
  reflection: 'TODO',
}
