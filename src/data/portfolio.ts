import type { ArtworkSpec, Experience, Portfolio, Project, SkillGroup, Track } from './types'

/**
 * All portfolio content lives here.
 *
 * To add a project: append an entry to `projects`. It appears automatically in
 * the iPod's Projects menu, Cover Flow, the split-view preview and Recruiter View.
 * To add a role: append to `experience` (kind 'work' or 'leadership').
 * To use a real screenshot: set `artwork.image` to a file in /public.
 */

const base = import.meta.env.BASE_URL

// -- Artwork --
const art = {
  iris: {
    image: `${base}projects/iris-logo.svg`,
    imageAlt: 'The Iris logo -- an eye that blinks as the dot of the "i"',
    monogram: 'IRIS',
    palette: ['#0b1f1c', '#eafffb', '#36e0cc'],
    motif: 'rings' as const,
  },
  polly: { monogram: 'P', palette: ['#1f3a5f', '#f4efe6', '#e8a33d'], motif: 'waveform' as const },
  up: { monogram: 'UP!', palette: ['#ebe4d2', '#1d4d3a', '#d9502f'], motif: 'bars' as const },
  portfolio: { monogram: 'GF', palette: ['#d7d8db', '#1c1c1e', '#2f6fd6'], motif: 'rings' as const },
  puberry: { monogram: 'Pb', palette: ['#7a1f3d', '#fbeef2', '#f2a541'], motif: 'grid' as const },
  augenta: { monogram: 'A', palette: ['#111a22', '#e8eef2', '#5cc8b0'], motif: 'orbit' as const },
  cuny: { monogram: 'CUNY', palette: ['#1d3f8f', '#ffffff', '#f5b700'], motif: 'stripes' as const },
  club: { monogram: 'QC', palette: ['#2b2d42', '#f8f4e3', '#ef8354'], motif: 'rings' as const },
  artic: { monogram: 'AR', palette: ['#0f172a', '#f8fafc', '#f97316'], motif: 'waveform' as const },
} satisfies Record<string, ArtworkSpec>

// -- Projects --
const projects: Project[] = [
  {
    id: 'iris',
    name: 'Iris',
    tagline: 'Hands-free web browsing for people with severe motor impairments: eyes aim, a double blink clicks, voice commands navigate.',
    description: 'A Chrome extension that solves the "Midas touch" problem (accidental clicks from looking) by separating aiming from clicking. Gaze and head position pick numbered page targets, double blink confirms (never clicks alone), and ElevenLabs voice agent maps spoken requests ("open history section") to page elements via Gemini vision. All camera data stays on-device; Gemini sees only masked page text and target numbers. Built in 3 days at HackKnight 2026 and placed 2nd overall, voted Most Popular Hack.',
    date: 'Oct 2026',
    role: 'Backend architecture and page-understanding pipeline: Cloudflare Worker, Gemini integration, masking broker, protocol design.',
    stack: ['TypeScript', 'Gemini API', 'Cloudflare Workers', 'MediaPipe', 'ElevenLabs', 'Chrome Extension (Manifest V3)'],
    highlights: [
      'Designed and shipped a privacy-first architecture: video and biometric data never leave the device; only masked page text and target coordinates reach Gemini, ensuring untraceable assistive browsing.',
      'Built the masking pipeline that intercepts page snapshots, redacts sensitive fields (forms, inputs), sends only clickable button/link text to Gemini, and maps responses back to numbered UI targets—the critical bridge between real-time sensor input and semantic page understanding.',
      'Implemented click-safety by design: gaze picks targets, but a double blink (user confirms) or dwell opens them—looking alone never clicks, solving the core UX problem for motor-impaired users.',
      'Shipped the backend endpoint (Gemini proxy + auth + rate-limiting) before the extension team built on it, establishing the data contract and unblocking parallel development in a 3-day sprint.',
      'Designed vendor-agnostic interfaces (GazeProvider, VoiceAgent, PageUnderstanding) so the team could swap Gemini for Claude or Presage for another gaze SDK without rewriting the extension.',
      'Designed and built the animated Iris logo (eye that blinks and glances as the dot of the "i") with reduced-motion support.',
    ],
    metrics: [
      { value: '2nd Place', label: 'HackKnight 2026' },
      { value: 'Most Popular', label: 'hacker-voted award' },
      { value: '<600 ms', label: 'Gemini target-match latency' },
    ],
    links: {
      github: 'https://github.com/bryan3342/iris_sentinel',
      demo: 'https://devpost.com/software/iris-58cvyt',
    },
    artwork: art.iris,
  },
  {
    id: 'artic',
    name: 'ARTIC',
    tagline: 'AI that shows local banks the business case for serving unbanked neighborhoods.',
    description: "Started as an 8-hour prototype at Microsoft's LEAD ASPIRE hackathon on a Mastercard Financial Inclusion brief, then built out over 11 days after Mastercard stakeholders asked us to keep going. ARTIC combines public banking and census data to value every neighborhood, bank, and branch, picks an evidence-backed campaign for each county, and designs a measured pilot so a bank can prove the return.",
    date: 'Oct 2026',
    role: 'Forward-deployed engineer and team lead: customer discovery, AI architecture, ROI and pilot design.',
    stack: ['Python', 'Azure AI Foundry', 'Microsoft Fabric', 'Power BI', 'pandas', 'Pydantic', 'Cloudflare Workers'],
    highlights: [
      'Embedded with Mastercard\'s Financial Inclusion team as a forward-deployed engineer: ran the discovery interview, drafted the statement of work, and reframed the problem from "find the data" to "win bank buy-in" after Mastercard said the hard part is persuading banks, not the analysis.',
      'Architected ARTIC\'s AI reasoning layer: a calibrated model selector with a rule-based fallback and an evaluation gold set that picks an evidence-backed Mastercard campaign for each county\'s biggest need, with guardrails that keep race and ethnicity proxies out and no AI-generated numbers.',
      'Turned customer constraints into product decisions: measure pilots instead of forecasting, keep data in the bank\'s own Azure tenant, and label every claim as observed, estimated, or hypothesis. Mastercard stakeholders asked to continue the work beyond the hackathon.',
      'Built the ROI engine\'s money model and pilot measurement system: values every neighborhood, bank, and branch from each bank\'s own FDIC margins and cost to serve, then designs matched-pair randomized test-vs-control pilots with power simulation, locked KPIs, a stop rule, and a verdict.',
      'Led a six-person team through ~180 pull requests in 11 days, setting the plans, reviewing and merging the work, and designing the data flow from 7+ public sources (FDIC, Census, HMDA, CFPB, USDA, Federal Reserve).',
      'Helped a teammate build the pitch deck for the final presentation to Mastercard and the judges.',
    ],
    metrics: [
      { value: '8 hrs → 11 days', label: 'hackathon prototype to ARTIC' },
      { value: '~180', label: 'PRs from a team of six' },
      { value: '7+', label: 'public data sources' },
    ],
    links: {
      live: 'https://lead-microsoft-project.bryanmejiaeducation.workers.dev',
    },
    artwork: art.artic,
  },
  {
    id: 'polly-debate-ai',
    name: 'Polly Debate AI',
    tagline: 'An AI debate coach that reads your voice and face in real time.',
    description: 'A full-stack debate coaching platform that analyzes live speech and facial expression while you practice, then turns it into feedback.',
    date: 'Oct 2025',
    role: 'React + WebRTC front end, Flask streaming back end',
    stack: ['Python', 'React', 'Flask', 'OpenCV', 'DeepFace', 'Google Speech-to-Text', 'WebRTC'],
    highlights: [
      'Real-time speech and facial-expression analysis with Google Speech-to-Text and DeepFace.',
      'Owned the React + WebRTC front end for live video capture.',
      'Flask back end streams frames through OpenCV at 30+ FPS.',
      'Improved users\' debate performance metrics by 56%.',
    ],
    metrics: [
      { value: '30+ FPS', label: 'live frame analysis' },
      { value: '56%', label: 'better debate metrics' },
    ],
    links: {
      github: 'https://github.com/bryan3342/Polly-AI',
      live: 'https://pollyai.pages.dev/',
      demo: 'https://devpost.com/software/polly-ai',
    },
    artwork: art.polly,
  },
  {
    id: 'up-investments',
    name: 'UP! Investments',
    tagline: 'Compare flip, long-term and short-term rental returns on a property.',
    description: 'A real-estate investment analysis platform that compares ROI across three strategies using live property data and market trends.',
    date: 'Oct 2025',
    stack: ['React', 'Node.js', 'Tailwind CSS', 'Cloudflare Workers'],
    highlights: [
      'Compares flip, long-term rental and short-term rental strategies side by side.',
      'Uses live Zillow property data and market trends.',
      'Serverless back end on Cloudflare Workers.',
      'Sub-200 ms API responses while cutting infrastructure cost by 80%.',
    ],
    metrics: [
      { value: '<200 ms', label: 'API responses' },
      { value: '80%', label: 'lower infra cost' },
    ],
    links: {
      github: 'https://github.com/SharlynBarreto/UP-Investments',
      demo: 'https://devpost.com/software/up-me4xbd',
    },
    artwork: art.up,
  },
  {
    id: 'ipod-portfolio',
    name: 'iPod Portfolio',
    tagline: 'This site -- a portfolio that runs like an iPod classic.',
    description: 'An interactive portfolio modeled on the 6th-generation iPod classic: hierarchical menus, a working rotary click wheel and synthesized clicks.',
    date: 'Sep 2026',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Web Audio API'],
    highlights: [
      'Rotary click wheel built on atan2 angle tracking with +/-180 degree wraparound handling.',
      'One typed content model drives the iPod menus and the Recruiter View.',
      'Click sounds synthesized with the Web Audio API -- no audio files.',
      'Full keyboard, screen-reader and reduced-motion support.',
    ],
    links: { github: 'https://github.com/gianca2020/Portfolio' },
    artwork: art.portfolio,
  },
]

// -- Experience --
const experience: Experience[] = [
  {
    id: 'puberry',
    organization: 'Puberry',
    menuLabel: 'Puberry',
    role: 'Software Engineering Intern',
    location: 'New York, NY',
    start: 'Jun 2026',
    end: 'Aug 2026',
    kind: 'work',
    summary: 'Shipped Duels, a trivia feature in 3 languages, to 1M students.',
    highlights: [
      'Led the mobile-responsive redesign of 3 user portals (student, teacher, parent), an 8-step registration and authentication flow, and the daily check-in interface -- validated across 3 iOS breakpoints and deployed to production.',
      'Built the front end for Duels, a turn-based trivia feature localized in English, Spanish and Greek, on a platform serving 1 million students.',
      'Implemented shared client-side input validation, fixed localization defects that rendered raw translation keys in production, and engineered focus-based polling for live roster updates.',
    ],
    metrics: [
      { value: '1M', label: 'students on the platform' },
      { value: '3', label: 'portals redesigned' },
    ],
    artwork: art.puberry,
  },
  {
    id: 'augenta-ai',
    organization: 'Augenta AI',
    menuLabel: 'Augenta AI',
    role: 'Forward Deployed Engineer',
    location: 'New York, NY',
    start: 'Mar 2026',
    end: 'Jun 2026',
    kind: 'work',
    summary: 'Built one telemetry adapter for Claude, Codex and Cursor agents.',
    highlights: [
      'Implemented a harness-agnostic adapter for AI coding agents (Claude, Codex, Cursor) that collects telemetry into the platform.',
      'Refactored the shared ingestion path and added an automated CI test suite so both agent integrations captured and recalled developer context identically.',
      'Delivered the customer-facing dashboard in React and TypeScript, deployed to Cloudflare Pages.',
      'Scaled the platform from single-user to multi-tenant organizations: a REST endpoint for full membership plus React views for member management.',
    ],
    stack: ['React', 'TypeScript', 'Cloudflare Pages', 'REST APIs', 'CI testing'],
    metrics: [
      { value: '3', label: 'agent harnesses' },
      { value: '1 -> N', label: 'single-user to multi-tenant' },
    ],
    artwork: art.augenta,
  },
  {
    id: 'cuny-financial-aid',
    organization: 'Office of Student Financial Assistance, CUNY',
    menuLabel: 'CUNY Financial Aid',
    role: 'Financial Aid Technical Assistant',
    location: 'New York, NY',
    start: 'May 2021',
    end: 'Present',
    kind: 'work',
    summary: 'Automated aid workflows for 15,000+ students; 40% less manual work.',
    highlights: [
      'Automated financial aid processing workflows with Excel VBA macros, supporting 15,000+ students annually.',
      'Cut manual processing time across 5 core processes by 40% while keeping 99.9% data accuracy across 10,000+ institutional records.',
      'Ran QA and accessibility testing across student portal systems, documenting 50+ defects and WCAG compliance violations for remediation.',
    ],
    stack: ['Excel VBA', 'QA testing', 'WCAG accessibility'],
    metrics: [
      { value: '40%', label: 'less manual processing' },
      { value: '99.9%', label: 'data accuracy' },
    ],
    artwork: art.cuny,
  },
  {
    id: 'qc-cs-club',
    organization: 'Queens College Computer Science Club',
    menuLabel: 'Leadership',
    role: 'Treasurer / Event Coordinator',
    location: 'Queens, NY',
    start: 'Feb 2024',
    end: 'Sep 2025',
    kind: 'leadership',
    summary: 'Ran a $15K+ club budget and took 40+ students to HackHarvard.',
    highlights: [
      'Managed the $8,000+ HackHarvard 2024 trip budget -- travel, lodging and registration for 40+ students.',
      'Oversaw a $15,000+ annual club budget, coordinating 10+ technical events (hackathons, workshops, speaker sessions) with 200+ total attendees.',
      'Organized and led an HTML/CSS workshop for 30+ students on front-end fundamentals and best practices.',
    ],
    metrics: [
      { value: '$15K+', label: 'annual budget' },
      { value: '200+', label: 'event attendees' },
    ],
    artwork: art.club,
  },
]

// -- Skills --
const skills: SkillGroup[] = [
  { name: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'SQL', 'HTML/CSS', 'Bash'] },
  { name: 'Frontend', items: ['React', 'Next.js (App Router)', 'Vite', 'Tailwind CSS', 'Chart.js', 'WebRTC'] },
  { name: 'Backend', items: ['Node.js', 'Express.js', 'NestJS', 'Flask', 'REST APIs'] },
  {
    name: 'AI',
    items: [
      'GPT-4 API integration',
      'AI coding agents (Claude Code, Codex)',
      'Agent memory capture & recall',
      'Agent tracing (OpenTelemetry)',
      'Google Speech-to-Text',
      'Computer vision (OpenCV, DeepFace)',
    ],
  },
  { name: 'Cloud', items: ['AWS (Amplify, Cognito, S3, CloudFront)', 'Cloudflare Pages', 'Cloudflare Workers'] },
  {
    name: 'Developer Tools',
    items: [
      'Git / GitHub',
      'GitHub Actions (CI)',
      'Jira',
      'Sentry',
      'PostHog',
      'Unit & end-to-end testing',
      'WCAG accessibility QA',
      'i18n (en / es / el)',
    ],
  },
]

// -- Now Playing easter egg --
const nowBuilding: Track[] = [
  { id: 'target-match', title: 'Target Match (Gemini Mix)', artist: 'Giancarlo Forero', album: 'Iris', duration: 196, artwork: art.iris },
  { id: 'duels', title: 'Duels (en / es / el)', artist: 'Giancarlo Forero', album: 'Puberry · Summer \'26', duration: 204, artwork: art.puberry },
  { id: 'multi-tenant', title: 'Multi-Tenant Orgs', artist: 'Giancarlo Forero', album: 'Augenta AI', duration: 178, artwork: art.augenta },
  { id: 'thirty-fps', title: '30+ FPS', artist: 'Giancarlo Forero', album: 'Polly Debate AI', duration: 221, artwork: art.polly },
  { id: 'sub-200', title: 'Sub-200 ms', artist: 'Giancarlo Forero', album: 'UP! Investments', duration: 167, artwork: art.up },
  { id: 'click-wheel', title: 'Click Wheel (Rotary Mix)', artist: 'Giancarlo Forero', album: 'iPod Portfolio', duration: 185, artwork: art.portfolio },
]

// -- Portfolio --
export const portfolio: Portfolio = {
  profile: {
    name: 'Giancarlo Forero',
    shortName: 'Giancarlo',
    title: 'Software Engineer',
    location: 'New York, NY',
    headline: 'Software engineer building production software across full-stack web, AI and cloud.',
    bio: [
      'I\'m a computer science student at CUNY Queens College who likes shipping real software to real users -- most recently a trivia feature for a platform serving a million students.',
      'I work across the stack: React and TypeScript front ends, Python and Node back ends, AI integrations, and serverless infrastructure on Cloudflare and AWS.',
    ],
    focus: ['Full-stack development', 'AI engineering', 'Cloud systems', 'Production software'],
    interests: [
      'AI agents & developer tooling',
      'Real-time computer vision',
      'Serverless & edge infrastructure',
      'Accessible, localized interfaces',
    ],
    initials: 'GF',
    photo: `${base}me.jpg`,
    education: {
      school: 'CUNY Queens College',
      degree: 'B.S. Computer Science',
      location: 'Queens, NY',
      graduation: 'May 2027',
    },
  },
  projects,
  experience,
  skills,
  contact: {
    email: { label: 'Email', display: 'gforero340@gmail.com', href: 'mailto:gforero340@gmail.com' },
    github: { label: 'GitHub', display: 'github.com/gianca2020', href: 'https://github.com/gianca2020' },
    linkedin: {
      label: 'LinkedIn',
      display: 'in/giancarlo-forero',
      href: 'https://www.linkedin.com/in/giancarlo-forero-58956623a',
    },
    website: { label: 'Website', display: 'giancarloforero.tech', href: 'https://www.giancarloforero.tech' },
  },
  resume: {
    href: `${base}resume/Giancarlo_Forero_Resume.pdf`,
    fileName: 'Giancarlo_Forero_Resume.pdf',
    updated: 'Oct 2026',
  },
  nowBuilding,
  sourceUrl: 'https://github.com/gianca2020/Portfolio',
}

export const findProject = (id: string) => portfolio.projects.find((p) => p.id === id)
export const findExperience = (id: string) => portfolio.experience.find((e) => e.id === id)
