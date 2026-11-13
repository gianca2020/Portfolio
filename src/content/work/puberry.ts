import type { CaseStudy } from './types.ts'

/*
 * Drafted from public descriptions of Puberry, the Puberry design boards (sign-up and login), three rounds of
 * review notes on the mobile builds, screen recordings, and the Puberry entry
 * in src/data/portfolio.ts. Media is cropped to drop browser chrome, staging
 * URLs and anything personal. 'TODO' fields are hidden on the page.
 */
export const puberry: CaseStudy = {
  slug: 'puberry',
  published: true,
  title: 'Puberry on mobile',
  summary:
    'Redesigning Puberry, “Duolingo for health” for K–12 schools, used by 1 million students, for phones: an 8-step sign-up designed for iPhone and Android, and the student, teacher and parent portals reworked through three rounds of review.',
  cover: {
    type: 'image',
    src: 'cover.webp',
    alt: 'Five iPhone screens from the redesigned Puberry sign-up: choose a role, enter your age, create a username, create a password with a live checklist, and a last step for an adult to confirm the account.',
  },
  snapshot: {
    role: 'Software Engineering Intern, fully in charge of design. I redesigned the platform for mobile and led the build.',
    team: 'Me and 2 intern engineers I led, with review rounds from the Puberry team',
    timeline: 'Jun – Aug 2026 (summer internship)',
    tools: ['HTML/CSS prototypes', 'Tailwind CSS'],
    platforms: ['iPhone (3 iOS breakpoints)', 'Portrait and landscape', 'Android (sign-up)'],
    metrics: [
      { value: '1M', label: 'students on the platform' },
      { value: '3', label: 'portals redesigned' },
      { value: '8', label: 'sign-up steps, redesigned' },
      { value: '3', label: 'review rounds' },
    ],
  },
  problem:
    'Puberry turns health education into a game, “Duolingo for health”: medically verified lessons for students aged 8 to 18, daily check-ins, mini-games and Berry Bucks to spend on your character. But it was built for desktop. On a phone, the student portal broke in small ways that added up: popups spilled past their edges, a section title sat on top of the card above it, the language dropdown needed sideways scrolling, and in lessons the button to move on was trapped below the lesson’s own scroll area, so students couldn’t find the next step.\n\nThe job was to make the student, teacher and parent portals, and the sign-up every new student starts with, work on phones across Apple devices, as the same web app rather than a separate one.',
  users: [
    {
      name: 'Students',
      description:
        'Reading lessons, playing through scenarios and answering trivia on a phone. They need big targets, one thing per screen, and the next step always in view.',
    },
    {
      name: 'Teachers',
      description:
        'Assigning lessons and managing classes from their phone. Adding a class and sharing class and school codes have to be the most obvious things on the screen.',
    },
    {
      name: 'Parents and guardians',
      description:
        'Confirming accounts for students under 13 and signing up when a child can’t do it alone. The flow has to hand off to them clearly.',
    },
  ],
  decisions: [
    {
      title: 'Design each sign-up screen for iPhone and Android, not one compromise',
      why:
        'I drew every sign-up screen twice, at iPhone (375px) and Pixel 7 (412px) widths, each following its platform’s conventions: a Back link and floating fields on iPhone, a back arrow and Material-style filled fields on Android.\n\nSame flow, same copy, same mascot. It just feels native on whichever phone a student opens it.',
      media: {
        type: 'image',
        src: 'signup-platforms.webp',
        alt: 'The “To get started, which one are you?” screen on an iPhone and on a Pixel 7, with Student, Teacher and Parent options and a Continue button; the Android version uses a back arrow and filled option cards.',
      },
      caption: 'Choose your role on iPhone (left) and Pixel 7 (right).',
    },
    {
      title: 'Make the under-13 check a path, not a dead end',
      why:
        'Students under 13 can’t create their own account. Rather than block them, the alert appears inline, right above the age picker, says why in plain words, and offers two ways forward: ask a parent or guardian, or go back and sign up with a school code, with a direct link to a parent account.',
      media: {
        type: 'image',
        src: 'under-13.webp',
        alt: '“How old are you?” with age 5 selected on iPhone and Pixel 7. An inline alert reads “Oops! Looks like you are under 13” and links to signing up for a parent account.',
      },
      caption: 'The under-13 alert on iPhone and Pixel 7, with the age picker still open below it.',
    },
    {
      title: 'Show the rules while they type',
      why:
        'Each username and password requirement is listed under its field and ticks green the moment it’s met, and the password has a show/hide toggle. A student can see exactly what’s left before tapping Continue, instead of finding out from an error.',
      media: {
        type: 'image',
        src: 'live-requirements.webp',
        alt: 'Two iPhone screens: “Create a username” with green ticks for no whitespace and at least 5 characters, and “Create a password” with green ticks for length, a number, upper and lower case letters and a special character.',
      },
      caption: 'Username and password requirements tick off as you type.',
    },
    {
      title: 'Reflow for landscape instead of shrinking',
      why:
        'Held sideways, an iPhone is only 375px tall, and the portrait layout would push Continue off screen. In landscape the mascot banner drops away and each screen splits into two columns: the question on the left, the answer and Continue on the right, all visible without scrolling.',
      media: {
        type: 'image',
        src: 'landscape.webp',
        alt: 'Two sign-up screens on an iPhone held sideways: the role choice and the under-13 age alert, each with the question in a left column and the options and Continue button in a right column.',
      },
      caption: 'Two-column landscape layouts on an iPhone (812 × 375).',
    },
    {
      title: 'Let lessons scroll like a page, so the next step is never hidden',
      why:
        'In review, the lesson text lived inside a white bubble with its own scroll area. When the lesson ended, the Start Scenario button sat below the bubble, out of reach, and students could finish reading without knowing where to go next.\n\nOn desktop a teacher character reads that bubble aloud. On mobile there isn’t one, so the bubble came out: the lesson scrolls with the page, the Start Scenario button is centred and in view, and the redundant “Ready when you are” line was dropped.',
      media: {
        type: 'video',
        src: 'lesson-continue.mp4',
        alt: 'Screen recording of the review build on an iPhone: scrolling a lesson inside its bubble, with the Click to start scenario button partly hidden below it.',
      },
      caption: 'The review build: the lesson’s own scroll area hides the button that comes next.',
    },
    {
      title: 'Stack, don’t squeeze',
      why:
        'Desktop layouts that sat side by side became deliberate stacks on a phone. The language label moved above its dropdown so it never scrolls sideways. On the profile, the card stays on top and the three stat cards regroup like the home page, with Streak and Berry Bucks side by side above Average Grade. Outfit cards shrank to two per row with four per page, and table dates shortened to MM/DD/YY so the columns line up.',
      media: {
        type: 'image',
        src: 'review-profile-stats.webp',
        alt: 'The student profile in the review build: Streak, Berry Bucks and Average Grade cards stacked in a single narrow column above Achievements.',
      },
      caption: 'The review build: three stat cards in one tall column, before they were regrouped.',
    },
  ],
  process: [
    {
      label: 'Review 1: student portal',
      src: 'review-student-portal.webp',
      alt: 'The Resources page in the student portal review build: an Ask an Anonymous Question button, an empty Learning Paths section, and the Blogs heading crowding the card above it.',
    },
    {
      label: 'Review 2: lessons and scenarios',
      src: 'review-lesson-flow.webp',
      alt: 'The end of a scenario in the review build: the berry bucks reward is one line of small text, and a large teacher character with a speech bubble fills the bottom of the screen.',
    },
    {
      label: 'Review 3: teacher portal',
      src: 'review-teacher-portal.webp',
      alt: 'The teacher portal lesson list in the review build, with Assign buttons, and a chat bubble covering the navigation in the bottom-right corner.',
    },
  ],
  finalDesign: {
    text:
      'Every sign-up screen asks one question with one primary action, the Blueberry mascot carries over from the desktop meadow as a banner, and login puts school sign-in (Clever and ClassLink) ahead of email and password.',
    media: [
      {
        type: 'video',
        src: 'signup-on-iphone.mp4',
        alt: 'Screen recording on an iPhone: choosing Student on the role screen, then the Join your school step with school code and teacher’s class code fields.',
      },
      {
        type: 'image',
        src: 'login.webp',
        alt: 'The Puberry login screen: the Blueberry mascot, “Welcome back, explorer!”, Log in with Clever and Log in with ClassLink buttons, then email and password fields and a Log In button.',
      },
    ],
  },
  links: [],
  outcome:
    'Shipped to production on a platform serving 1 million students: the student, teacher and parent portals, plus the 8-step sign-up and login, validated across 3 iOS breakpoints. The Puberry team praised the design work, and I went on to design Duels, the platform’s first mini-game.',
  reflection: 'TODO',
}
