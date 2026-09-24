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

// ── Artwork ────────────────────────────────────────────────────────────────
const art = {
  polly: { monogram: 'P', palette: ['#1f3a5f', '#f4efe6', '#e8a33d'], motif: 'waveform' },
  up: { monogram: 'UP!', palette: ['#ebe4d2', '#1d4d3a', '#d9502f'], motif: 'bars' },
  portfolio: { monogram: 'GF', palette: ['#d7d8db', '#1c1c1e', '#2f6fd6'], motif: 'rings' },
  puberry: { monogram: 'Pb', palette: ['#7a1f3d', '#fbeef2', '#f2a541'], motif: 'grid' },
  augenta: { monogram: 'A', palette: ['#111a22', '#e8eef2', '#5cc8b0'], motif: 'orbit' },
  cuny: { monogram: 'CUNY', palette: ['#1d3f8f', '#ffffff', '#f5b700'], motif: 'stripes' },
  club: { monogram: 'QC', palette: ['#2b2d42', '#f8f4e3', '#ef8354'], motif: 'rings' },
} satisfies Record<string, ArtworkSpec>

// ── Projects ───────────────────────────────────────────────────────────────
const projects: Project[] = [
  {
    id: 'polly-debate-ai',
    name: 'Polly Debate AI',
    tagline: 'An AI debate coach that reads your voice and face in real time.',
    description:
      'A full-stack debate coaching platform that analyzes live speech and facial expression while you practice, then turns it into feedback.',
    date: 'Oct 2025',
    role: 'React + WebRTC front end, Flask streaming back end',
    stack: ['Python', 'React', 'Flask', 'OpenCV', 'DeepFace', 'Google Speech-to-Text', 'WebRTC'],
    highlights: [
      'Real-time speech and facial-expression analysis with Google Speech-to-Text and DeepFace.',
      'Owned the React + WebRTC front end for live video capture.',
      'Flask back end streams frames through OpenCV at 30+ FPS.',
      'Improved users’ debate performance metrics by 56%.',
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
    description:
      'A real-estate investment analysis platform that compares ROI across three strategies using live property data and market trends.',
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
    // Third slot: this site. Replace or append more projects freely (View Source uses `sourceUrl` below).
    id: 'ipod-portfolio',
    name: 'iPod Portfolio',
    tagline: 'This site — a portfolio that runs like an iPod classic.',
    description:
      'An interactive portfolio modeled on the 6th-generation iPod classic: hierarchical menus, a working rotary click wheel and synthesized clicks.',
    date: 'Sep 2026',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Web Audio API'],
    highlights: [
      'Rotary click wheel built on atan2 angle tracking with ±180° wraparound handling.',
      'One typed content model drives the iPod menus and the Recruiter View.',
      'Click sounds synthesized with the Web Audio API — no audio files.',
      'Full keyboard, screen-reader and reduced-motion support.',
    ],
    links: { github: 'https://github.com/gianca2020/Portfolio' },
    artwork: art.portfolio,
  },
]

// ── Experience ─────────────────────────────────────────────────────────────
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
      'Led the mobile-responsive redesign of 3 user portals (student, teacher, parent), an 8-step registration and authentication flow, and the daily check-in interface — validated across 3 iOS breakpoints and deployed to production.',
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
      { value: '1 → N', label: 'single-user to multi-tenant' },
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
      'Managed the $8,000+ HackHarvard 2024 trip budget — travel, lodging and registration for 40+ students.',
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

// ── Skills ─────────────────────────────────────────────────────────────────
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

// ── Now Playing easter egg ─────────────────────────────────────────────────
const nowBuilding: Track[] = [
  { id: 'duels', title: 'Duels (en / es / el)', artist: 'Giancarlo Forero', album: 'Puberry · Summer ’26', duration: 204, artwork: art.puberry },
  { id: 'multi-tenant', title: 'Multi-Tenant Orgs', artist: 'Giancarlo Forero', album: 'Augenta AI', duration: 178, artwork: art.augenta },
  { id: 'thirty-fps', title: '30+ FPS', artist: 'Giancarlo Forero', album: 'Polly Debate AI', duration: 221, artwork: art.polly },
  { id: 'sub-200', title: 'Sub-200 ms', artist: 'Giancarlo Forero', album: 'UP! Investments', duration: 167, artwork: art.up },
  { id: 'click-wheel', title: 'Click Wheel (Rotary Mix)', artist: 'Giancarlo Forero', album: 'iPod Portfolio', duration: 185, artwork: art.portfolio },
]

// ── Portfolio ──────────────────────────────────────────────────────────────
export const portfolio: Portfolio = {
  profile: {
    name: 'Giancarlo Forero',
    shortName: 'Giancarlo',
    title: 'Software Engineer',
    location: 'New York, NY',
    headline: 'Software engineer building production software across full-stack web, AI and cloud.',
    bio: [
      'I’m a computer science student at CUNY Queens College who likes shipping real software to real users — most recently a trivia feature for a platform serving a million students.',
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
  },
  resume: {
    href: `${base}resume/Giancarlo_Forero_Resume.pdf`,
    fileName: 'Giancarlo_Forero_Resume.pdf',
    updated: 'Sep 2026',
  },
  nowBuilding,
  sourceUrl: 'https://github.com/gianca2020/Portfolio',
}

export const findProject = (id: string) => portfolio.projects.find((p) => p.id === id)
export const findExperience = (id: string) => portfolio.experience.find((e) => e.id === id)
