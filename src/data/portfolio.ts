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
    description: 'A Chrome extension that solves the "Midas touch" problem (accidental clicks from looking) by separating aiming from clicking. Gaze and head position pick numbered page targets, double blink confirms (never clicks alone), and ElevenLabs voice agent maps spoken requests ("open history section") to page elements via Gemini vision. All camera data stays on-device; Gemini sees only masked page text and target numbers. Built in 48 hours by a team of 4 at HackKnight 2026 and placed 2nd overall, voted Most Popular Hack.',
    date: 'Oct 2026',
    role: 'Backend architecture and page-understanding pipeline: Cloudflare Worker, Gemini integration, masking broker, protocol design.',
    stack: ['TypeScript', 'Gemini API', 'Cloudflare Workers', 'MediaPipe', 'ElevenLabs', 'Chrome Extension (Manifest V3)'],
    highlights: [
      'Designed and shipped a privacy-first architecture: video and biometric data never leave the device; only masked page text and target coordinates reach Gemini, ensuring untraceable assistive browsing.',
      'Built the masking pipeline that intercepts page snapshots, redacts sensitive fields (forms, inputs), sends only clickable button/link text to Gemini, and maps responses back to numbered UI targets—the critical bridge between real-time sensor input and semantic page understanding.',
      'Implemented click-safety by design: gaze picks targets, but a double blink (user confirms) or dwell opens them—looking alone never clicks, solving the core UX problem for motor-impaired users.',
      'Shipped the backend endpoint (Gemini proxy + auth + rate-limiting) before the extension team built on it, establishing the data contract and unblocking parallel development in a 48-hour sprint.',
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
    tagline: 'AI that shows local banks the business case for serving unbanked and underbanked neighborhoods.',
    description: "Started as an 8-hour prototype at Microsoft's LEAD ASPIRE hackathon on a Mastercard Financial Inclusion brief, then built out over 11 days after Mastercard stakeholders asked the team to continue the work. ARTIC runs on real-world federal data, not synthetic samples (FDIC bank financials and branch locations, U.S. Census ACS household data, HMDA mortgage lending records, CFPB consumer complaints, USDA rural-urban codes, and Philadelphia Fed banking-desert status), to value every neighborhood, bank, and branch, uses an LLM to pick an evidence-backed campaign for each county, and designs a measured pilot so a bank can test the return before scaling.",
    date: 'Oct 2026',
    role: 'Customer discovery, AI decision layer, and ROI engine: requirements, LLM campaign selector, money model, and pilot design.',
    stack: ['Python', 'Azure AI Foundry', 'Microsoft Fabric', 'TypeSafe Jev', 'OpenRouter', 'pandas', 'Pydantic', 'Apache Parquet', 'REST APIs', 'Power BI', 'pytest', 'GitHub Actions', 'Cloudflare Workers'],
    highlights: [
      "Architected ARTIC's AI decision layer on TypeSafe's Jev via OpenRouter: calibrated Choice and Score calls pick an evidence-backed Mastercard campaign per county, behind a typed client interface with a rule-based fallback, a failure circuit breaker, and an evaluation set.",
      "Built the ROI engine's money model in Python and pandas, valuing 96 banks and 1,287 branches in Houston from each bank's own FDIC margins and cost to serve, at about $292 in modeled five-year value per customer.",
      "Worked forward-deployed with Mastercard's Financial Inclusion team: helped run customer discovery and turned their constraints into requirements, including measured pilots instead of forecasts and data kept in each bank's own Azure tenant.",
      "Merged 26 of the team's 143 pull requests in 11 days, into a codebase with 158 pytest tests in GitHub Actions CI and Python data pipelines that pull real-world data from the FDIC BankFind, U.S. Census ACS, HMDA, and CFPB APIs into Parquet for all 50 states.",
      'Designed randomized test-versus-control (A/B) pilots with matched pairs, statistical power simulation, locked key performance indicators (KPIs), and a stop rule, plus guardrails that keep race and ethnicity proxies out of campaign selection.',
      'Helped a teammate build the pitch deck for the final presentation to Mastercard and the hackathon judges.',
    ],
    metrics: [
      { value: '1,287', label: 'branches modeled across 96 Houston banks' },
      { value: '158', label: 'automated tests in CI' },
      { value: '7', label: 'real-world federal data sources' },
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
    ],
    metrics: [
      { value: '30+ FPS', label: 'live frame analysis' },
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
      'Led 2 intern engineers in the mobile-responsive redesign of 3 user portals (student, teacher, parent), an 8-step registration and authentication flow, and the daily check-in interface -- validated across 3 iOS breakpoints and deployed to production.',
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
    summary: 'Took an agent-memory platform live for 2 healthcare clients in 2 weeks each.',
    highlights: [
      "Deployed Augenta's Azure-hosted agent-memory platform to production for 2 healthcare startup clients, each live and HIPAA compliant within 2 weeks, porting it across 4 LLM providers to fit each client's compliance needs.",
      'Built a harness-agnostic OpenTelemetry adapter that captures Claude Code, Codex and Cursor sessions and streams them via Azure Event Hubs to the memory engine, with CI tests verifying recall across all 3.',
      'Contributed to cross-session context injection that cut token usage 24% and raised recall 33% in team benchmarks.',
      'Scaled the platform from single users to multi-tenant organizations by building REST membership endpoints and React/TypeScript admin views deployed on Cloudflare Pages.',
    ],
    stack: ['Azure', 'Azure OpenAI', 'OpenTelemetry', 'Azure Event Hubs', 'React', 'TypeScript', 'Cloudflare Pages', 'REST APIs', 'CI testing'],
    metrics: [
      { value: '2 weeks', label: 'to HIPAA-compliant production' },
      { value: '24%', label: 'less token usage' },
      { value: '33%', label: 'better recall' },
    ],
    artwork: art.augenta,
  },
  {
    id: 'cuny-financial-aid',
    organization: 'Office of Student Financial Assistance, CUNY',
    menuLabel: 'CUNY Financial Aid',
    role: 'Financial Aid Technical Assistant (Part-Time)',
    location: 'Queens, NY',
    start: 'May 2021',
    end: 'Present',
    kind: 'work',
    summary: 'Automated aid workflows for 15,000+ students; 40% less manual work.',
    highlights: [
      'Automated 5 financial aid workflows with Excel VBA, cutting manual processing time 40% for 15,000+ students.',
      'Ran QA and WCAG accessibility testing on student portals, documenting 50+ defects for remediation.',
    ],
    stack: ['Excel VBA', 'QA testing', 'WCAG accessibility'],
    metrics: [
      { value: '40%', label: 'less manual processing' },
      { value: '50+', label: 'defects documented' },
    ],
    artwork: art.cuny,
  },
  {
    id: 'qc-cs-club',
    organization: 'Queens College Computer Science Club',
    menuLabel: 'Leadership',
    role: 'Treasurer and Event Coordinator',
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
  { name: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C++', 'SQL', 'HTML/CSS', 'Bash'] },
  { name: 'Frontend', items: ['React', 'Next.js (App Router)', 'Vite', 'Tailwind CSS', 'Chart.js', 'WebRTC'] },
  { name: 'Backend', items: ['Node.js', 'Express.js', 'NestJS', 'Flask', 'REST APIs', 'pandas', 'Pydantic'] },
  {
    name: 'AI',
    items: [
      'LLM APIs (Claude, OpenAI, Gemini, Azure OpenAI)',
      'AI coding agents (Claude Code, Codex)',
      'Agent memory capture & recall',
      'Agent tracing (OpenTelemetry)',
      'Google Speech-to-Text',
      'Computer vision (OpenCV, DeepFace)',
    ],
  },
  {
    name: 'Cloud',
    items: ['Azure (AI Foundry, Event Hubs)', 'Microsoft Fabric', 'AWS (Amplify, Cognito, S3, CloudFront)', 'Cloudflare Pages', 'Cloudflare Workers'],
  },
  {
    name: 'Developer Tools',
    items: [
      'Git / GitHub',
      'GitHub Actions (CI)',
      'pytest',
      'Jira',
      'Sentry',
      'PostHog',
      'Unit & end-to-end testing',
      'WCAG accessibility QA',
      'Power BI',
      'Excel VBA',
      'i18n (en / es / el)',
    ],
  },
]

// -- Now Playing easter egg: songs on repeat, played through Spotify's embed --
/** Album covers come from Spotify's image CDN; the generated cover is the fallback if one fails to load. */
const spotifyCover = (hash: string) => `https://i.scdn.co/image/ab67616d00001e02${hash}`

const nowPlaying: Track[] = [
  { id: 'portal', spotifyId: '7LYCoMFe1ciXBMdwZLmvG2', title: 'Portal', artist: 'Fine', album: 'Portal', duration: 144, artwork: { image: spotifyCover('3d5ca71998d457565f91c274'), imageAlt: 'Portal cover', monogram: 'P', palette: ['#20242c', '#e9e4da', '#8fb4d9'], motif: 'orbit' } },
  { id: 'know-who-you-are', spotifyId: '4IdcRddA9tKLvTwpymycpU', title: 'Know Who You Are at Every Age', artist: 'Cocteau Twins', album: 'Four-Calendar Café', duration: 220, artwork: { image: spotifyCover('3eec753a75cfd369b65e6972'), imageAlt: 'Four-Calendar Café cover', monogram: 'CT', palette: ['#d9c7b8', '#3b2f2f', '#a8786a'], motif: 'waveform' } },
  { id: 'glider', spotifyId: '6fyMExLM9mmtXAQKCnTaZG', title: 'Glider', artist: 'Japanese Breakfast', album: 'Sable (Original Video Game Soundtrack)', duration: 171, artwork: { image: spotifyCover('702d716b9dd10ab2129e563a'), imageAlt: 'Sable (Original Video Game Soundtrack) cover', monogram: 'JB', palette: ['#f2c46d', '#2b2330', '#d96c4e'], motif: 'rings' } },
  { id: 'white-ferrari', spotifyId: '2LMkwUfqC6S6s6qDVlEuzV', title: 'White Ferrari', artist: 'Frank Ocean', album: 'Blonde', duration: 249, artwork: { image: spotifyCover('c5649add07ed3720be9d5526'), imageAlt: 'Blonde cover', monogram: 'FO', palette: ['#e8e6e1', '#1d1d1f', '#9a9a9a'], motif: 'stripes' } },
  { id: 'modern-love', spotifyId: '3gxEZXUjrNbl3TlSrTGbR5', title: 'Modern Love', artist: 'David Bowie', album: 'Let\'s Dance (2018 Remaster)', duration: 288, artwork: { image: spotifyCover('db0917ddd4139153bc1d1a1a'), imageAlt: 'Let\'s Dance (2018 Remaster) cover', monogram: 'DB', palette: ['#1c1c1c', '#f4f1ea', '#d63a2f'], motif: 'bars' } },
  { id: 'cry-for-me', spotifyId: '2RhHct6gGXSrZ1zHjovhRq', title: 'Cry for Me', artist: 'Magdalena Bay', album: 'Imaginal Disk', duration: 307, artwork: { image: spotifyCover('a3390485ba30a0a99feaa0dd'), imageAlt: 'Imaginal Disk cover', monogram: 'MB', palette: ['#2a1f4a', '#f6d7f0', '#7ad3c8'], motif: 'orbit' } },
  { id: 'suga-honey-iced-tea', spotifyId: '6HjzGcCtnFNfzA3N1ftR2v', title: 'Suga Honey Iced Tea', artist: 'Kelis', album: 'Tasty', duration: 203, artwork: { image: spotifyCover('80c0124b18f8d2e3152bbb02'), imageAlt: 'Tasty cover', monogram: 'K', palette: ['#f5d36b', '#3a2414', '#e0823c'], motif: 'grid' } },
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
  nowPlaying,
  sourceUrl: 'https://github.com/gianca2020/Portfolio',
}

export const findProject = (id: string) => portfolio.projects.find((p) => p.id === id)
export const findExperience = (id: string) => portfolio.experience.find((e) => e.id === id)
