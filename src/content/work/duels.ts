import type { CaseStudy } from './types.ts'

/*
 * Drafted from the Duels project timeline (rules, roles, sprints), a 4-minute
 * two-player demo recording, and the Puberry entry on the resume. Stills and
 * the clip are cropped to the game itself (no browser chrome or dev URLs);
 * frames showing logins and emails are left out. 'TODO' fields are hidden.
 */
export const duels: CaseStudy = {
  slug: 'duels',
  published: true,
  title: 'Duels',
  summary:
    'A 1v1 trivia battle I designed for Puberry: two classmates answer questions from a lesson they’ve both finished, the fastest right answer lands a hit, and the first to lose three hearts loses. Pixel art, asynchronous play, shipped in three languages.',
  cover: {
    type: 'image',
    src: 'cover.webp',
    alt: 'Both players’ screens during a Duels battle in pixel art: two Puberry characters on a playground with their names and hearts overhead and a question with four answers below; on the second screen, “Waiting for opponent…”.',
  },
  snapshot: {
    role: 'Designed all of Duels, every screen and the pixel-art look, and built the student match-play, results and teacher leaderboard front end',
    team: 'Me and 2 intern engineers, who built the lobby and match creation and the scoring back end',
    timeline: 'Two sprints, Jul 27 – Aug 7, 2026',
    tools: [],
    platforms: ['Student portal (web)', 'Teacher portal (web)'],
    metrics: [
      { value: '1M', label: 'students on the platform' },
      { value: '3', label: 'languages: English, Spanish, Greek' },
      { value: '3', label: 'hearts per player' },
      { value: '5', label: 'questions per duel, at most' },
    ],
  },
  problem:
    'Puberry is “Duolingo for health”: short lessons, daily check-ins and Berry Bucks to spend on your character. Its Mini Games tab was still a “Games are on the way!” placeholder. Duels is the first game in it, a reason to come back to a lesson you’ve finished and review it against a classmate.\n\nThe constraints shaped the design. Play had to be asynchronous, with no live connection and no need for both students to be online at once. It had to sit on top of the existing lessons and Berry Bucks, give teachers control lesson by lesson, and ship in two sprints.',
  users: [
    {
      name: 'Students',
      description:
        'Reviewing a lesson they’ve already finished, against a classmate rather than alone. They need the rules in seconds and a reason to play one more round.',
    },
    {
      name: 'Teachers',
      description:
        'Choosing which lessons are open for duels and seeing who’s playing. They need a single switch per lesson and a leaderboard one tap away.',
    },
  ],
  decisions: [
    {
      title: 'Turn review into a battle, not another quiz',
      why:
        'The same questions a student already answered in a lesson come back as a fight on a pixel-art playground. Each player is a Puberry character with their name and hearts overhead, and the question sits in a retro battle menu below, like a classic RPG.\n\nIt’s the same content, but it reads as a game you choose to play rather than homework you have to finish.',
      media: {
        type: 'image',
        src: 'direct-hit.webp',
        alt: 'A Duels round in pixel art: “DIRECT HIT!” over the playground as one character is struck, with the correct answer highlighted green in the answer panel.',
      },
      caption: 'A correct, faster answer lands a direct hit.',
    },
    {
      title: 'Make speed and accuracy both count',
      why:
        'A round goes to whoever answers correctly and fastest, and the other player loses a heart. Feedback lands right on the battlefield: “DIRECT HIT!” or “MISS!”, with the chosen answer turning green or red.\n\nEveryone starts with 3 hearts and a duel is at most 5 questions, ending the instant someone hits zero. If both players miss, nobody loses a heart and the question comes back in a later duel, so students are re-tested on exactly what they got wrong.',
      media: {
        type: 'image',
        src: 'miss.webp',
        alt: 'A Duels round in pixel art: “MISS!” over the playground, the chosen answer highlighted red and the correct one green, and a heart lost from the player’s row.',
      },
      caption: 'A wrong answer misses, and the panel shows which answer was right.',
    },
    {
      title: 'Design for asynchronous play, so no one waits in silence',
      why:
        'There’s no live connection: each answer is logged with its response time and the round is resolved once both are in. That means one player often finishes first, so that moment is designed too. They see “Waiting for opponent…” over a dimmed battlefield instead of a frozen screen, and the result arrives when the other player answers.',
      media: {
        type: 'image',
        src: 'async-round.webp',
        alt: 'Both players’ screens at the same moment: on the left “Waiting for opponent…” over a dimmed battle, on the right “DEFEAT — lucaduels wins this round” with a Return to lobby button.',
      },
      caption: 'Both players at the same moment: one is waiting, the other has already lost the round.',
    },
    {
      title: 'Challenge a classmate, not a stranger',
      why:
        'Students pick a lesson they’ve finished, then a classmate to challenge, and the other student can accept or decline. Keeping duels inside the class makes them social and safe, and only showing completed lessons means nobody is quizzed on material they haven’t seen.',
      media: {
        type: 'image',
        src: 'challenge.webp',
        alt: '“Choose your rival” in pixel art: an incoming challenge from a classmate with Accept and Decline buttons, and the list of classmates to challenge below.',
      },
      caption: 'An incoming challenge, with Accept and Decline.',
    },
    {
      title: 'Teach the rules in one screen',
      why:
        'Before the first round, four short lines explain everything: answer faster than your rival, a right answer lands a hit, wrong or too slow takes one, and first to 3 hearts wins. Then a single “I’m ready” button starts the duel. No tutorial to sit through.',
      media: {
        type: 'image',
        src: 'how-to-duel.webp',
        alt: '“How to duel” in pixel art: four rules about answering faster, hits and hearts, above a yellow “I’m ready” button.',
      },
      caption: 'The whole rulebook, in four lines.',
    },
    {
      title: 'Put teachers in control, one lesson at a time',
      why:
        'In the teacher portal every assigned lesson gets a Duels switch, off by default. Turning it on opens the lesson for duels and adds a View Leaderboard button to its card, so teachers decide what gets reviewed this way and can see who’s playing.',
      media: {
        type: 'image',
        src: 'teacher-toggle.webp',
        alt: 'Assigned lessons in the teacher portal: one lesson with its Duels switch off, and another with Duels switched on and a View Leaderboard button.',
      },
      caption: 'The Duels switch on each assigned lesson in the teacher portal.',
    },
  ],
  process: [
    {
      label: 'Start',
      src: 'title.webp',
      alt: 'The Duels title screen: “DUELS, 1 v 1 trivia battle” in yellow pixel letters with a Start button.',
    },
    {
      label: 'Pick a lesson you’ve finished',
      src: 'lesson-select.webp',
      alt: '“Choose a lesson” in pixel art, listing a finished lesson about healthy eating and nutrients.',
    },
    {
      label: 'Class leaderboard',
      src: 'leaderboard.webp',
      alt: 'The Duels leaderboard in pixel art, ranking two students by their scores.',
    },
  ],
  finalDesign: {
    text:
      'A full round, from the first question to the result. Everything a student needs is on one screen: both players’ hearts, a timer bar, the question and four answers, with each hit or miss landing on the battlefield.',
    media: [
      {
        type: 'video',
        src: 'battle.mp4',
        alt: 'Screen recording of a Duels match: questions about healthy eating, hits and misses on the pixel-art playground, hearts dropping, and the round result.',
      },
    ],
  },
  links: [],
  outcome:
    'Shipped to production on Puberry, a platform serving 1 million students, localized in English, Spanish and Greek.',
  reflection: 'TODO',
}
