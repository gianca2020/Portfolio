import type { CaseStudy } from './types.ts'

/*
 * Drafted from the ARTIC handoff; every decision was checked against the live
 * dashboard on Nov 13, 2026, and the screenshots were taken from it at
 * 1440 × 900. 'TODO' fields (the design tool) are hidden on the page.
 */
export const artic: CaseStudy = {
  slug: 'artic',
  published: true,
  title: 'ARTIC: Making Banking-Desert Data Usable Without a Data Analyst',
  summary:
    'I designed the full interface for ARTIC, an AI tool that shows banks the business case for serving unbanked neighborhoods. The goal: turn six federal datasets into something a bank or Mastercard decision maker can use with no one in the room to explain it.',
  cover: {
    type: 'image',
    src: 'cover.webp',
    alt: 'ARTIC overview for Texas: headline figures for underserved households, value per customer and market opportunity above a county heat map.',
  },
  snapshot: {
    role: 'Sole designer (all UI and UX) on a team of 6 · also built the AI decision layer and ROI engine',
    team: '6 people',
    timeline: 'Designed in under a week · Microsoft LEAD ASPIRE hackathon → 11-day build for Mastercard, Oct 2026',
    tools: ['TODO'],
    platforms: ['Web dashboard'],
    metrics: [
      { value: '6', label: 'federal datasets behind one interface' },
      { value: '6', label: 'stops in the built-in guided tour' },
      { value: '3', label: 'planning cases shown side by side: Conservative, Base, Optimistic' },
    ],
  },
  problem:
    'Mastercard’s Financial Inclusion team needed a way to show banks why serving unbanked and underbanked neighborhoods makes business sense. The evidence existed, but it was spread across FDIC bank financials, Census household data, mortgage lending records, consumer complaints, and banking-desert maps.\n\nThe people deciding (bank leaders and Mastercard’s team) aren’t data analysts. If the interface needed someone to explain it, it would fail in the room where it mattered.',
  users: [
    {
      name: 'Mastercard’s Financial Inclusion team',
      description: 'A tool to put in front of partner banks that makes the case for expanding into underserved areas.',
    },
    {
      name: 'Bank leaders',
      description:
        'A fast, credible answer: is there an opportunity, where is it, what is a customer worth, and what should we try first?',
    },
    {
      name: 'Analysts at those organizations',
      description: 'The numbers behind every headline, so they can check the work before anyone commits money.',
    },
  ],
  decisions: [
    {
      title: 'Organize the product around three questions: who, where, how',
      why:
        'A bank deciding whether to serve a neighborhood is really asking who it’s missing, where they are, and how to win them. The dashboard is built to answer exactly that: how many households are underserved, where they live relative to branches, what each new customer is worth, and which campaign will reach them.\n\nThe sidebar mirrors it (Overview, Locations, Campaign), so users always know which question they’re on.',
      media: {
        type: 'image',
        src: 'overview.webp',
        alt: 'ARTIC overview with three headline cards: underserved households, net value per customer, and market opportunity.',
      },
      caption: 'Three headline cards, one for each part of the answer.',
    },
    {
      title: 'Lead with the heat map',
      why:
        'The map drives the first pillar and is the fastest way to understand the problem: darker means more underserved households. It sits right under the headline figures on the launch page, next to a ranked county list, so the picture and the numbers support each other.\n\nI used a single-hue orange scale that gets steadily darker with each step. That keeps the order readable even for colorblind users, because lightness carries the meaning, not hue. Bank branches are plotted in blue, the opposite of orange, so they stand out on every shade.',
      media: {
        type: 'image',
        src: 'heatmap.webp',
        alt: 'Texas county heat map in five shades from pale orange to dark red, next to a ranked list of counties by underserved households, led by Harris (447K).',
      },
      caption: 'Map for the pattern, ranked list for the exact numbers.',
    },
    {
      title: 'Build the explanation into the product: a 6-stop guided tour',
      why:
        'Users shouldn’t need a person to walk them through it. On first visit, ARTIC opens a short tour written in plain language: “Find the customers your bank is missing.” Each stop highlights one part of the screen and explains it in one or two sentences, from the need to the map to what a customer is worth to the recommended campaign.\n\nIt can be skipped, and replayed any time from the sidebar.',
      media: {
        type: 'image',
        src: 'tour.webp',
        alt: 'Guided tour step 2 of 6, “Where they live, and where branches aren’t”, highlighting the opportunity map and explaining that darker counties hold more underserved households.',
      },
      caption: 'Plain language, one idea per stop.',
    },
    {
      title: 'Show why the AI picked each campaign',
      why:
        'ARTIC uses an AI reasoning model to choose a campaign for each county, and a bank won’t act on a recommendation it can’t explain to its own leadership. So every pick comes with its reason: a “Community Needs” chart compares each local need against the wider area and marks the one that stands out.\n\nThe campaign is built on that need, so the AI’s choice reads as an argument with evidence, not a black box.',
      media: {
        type: 'image',
        src: 'campaign.webp',
        alt: 'Campaign page for Harris County and Woodforest National Bank: the Community Needs chart marks branch access as the standout need, at 1.54 times the Texas level.',
      },
      caption: 'The standout need is marked, and the campaign is built on it.',
    },
    {
      title: 'Be honest about uncertainty',
      why:
        'Projections can sell a bad idea if they only show the best case. Every forecast in ARTIC is labeled as an Estimate or a Projection, and a Conservative / Base / Optimistic switch runs across the whole dashboard.\n\nThe conservative case is shown even when it’s negative (in red), so a bank sees the downside before it commits.',
      media: {
        type: 'image',
        src: 'scenarios.webp',
        alt: 'Opportunity calculation for one bank, from households reached to a $1.94M five-year opportunity, above the three cases: Conservative at −$582K in red, Base at $1.94M and Optimistic at $5.44M.',
      },
      caption: 'The downside is on screen, not hidden.',
    },
    {
      title: 'Headline first, full breakdown underneath',
      why:
        'Executives need the takeaway; their analysts need to pick it apart. Each page leads with a few large numbers, and the supporting detail sits below in labeled sections: value components, payback, scenario comparison, Mastercard-specific views.\n\nThat way each organization can dig as deep as it needs without overwhelming a first-time viewer.',
      media: {
        type: 'image',
        src: 'breakdown.webp',
        alt: 'Customer value breakdown as a waterfall chart, from debit interchange and deposit spread down through servicing and acquisition costs to a $145 net five-year value, beside payback figures and a scenario comparison.',
      },
      caption: 'Readable at a glance, checkable underneath.',
    },
  ],
  process: [],
  finalDesign: {
    text:
      'Drilled into a single county, the same visual language carries down to census tracts: lightness for need, and the chosen bank’s branches in blue against every other branch.',
    media: [
      {
        type: 'image',
        src: 'county-map.webp',
        alt: 'Harris County map shaded by underserved households per census tract, with Woodforest National Bank’s branches in blue and other banks’ branches in dark gray.',
      },
    ],
  },
  links: [{ label: 'Open the live dashboard', href: 'https://lead-microsoft-project.bryanmejiaeducation.workers.dev' }],
  outcome:
    'ARTIC started as an 8-hour prototype at Microsoft’s LEAD ASPIRE hackathon. Mastercard’s stakeholders asked the team to keep building it, and after the final presentation they asked to meet with us about purchasing it.',
  reflection:
    'Auditing the shipped design for accessibility afterward, I found what worked and what I’d fix. The heat map scale holds up: simulated for red-green and blue-yellow color blindness, each shade stays darker than the one before it, so the ranking still reads.\n\nBut the two middle shades get close together under red-green color blindness. The lightest shade is nearly the same lightness as the map’s gray background (1.1:1). The counties can’t be reached by keyboard or screen reader either. The ranked county list with search covers that information, but the map itself doesn’t.\n\nNext time I’d add another step of lightness between the middle shades, outline the lightest counties, make each county focusable with a label like “Harris County, 447K underserved”, and test with real bank staff instead of judging clarity myself under a one-week deadline.',
}
