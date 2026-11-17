import type { GalleryItem } from './types'

/**
 * One-off design pieces for the /work gallery. Image `src` is a file name in
 * public/work/gallery/. While this list is empty the gallery section is hidden
 * and the iPod doesn't list “More Design Work”.
 *
 * Posters designed in Canva for campus CS clubs. Art of Programming Languages
 * and Python for Beginners still carry faint Canva watermarks,
 * and Code 4 a Cause is an unfinished draft with placeholder date and venue.
 * Exports still in portfolio-assets/gallery/held-back/ aren't shown.
 */
export const gallery: GalleryItem[] = [
  {
    title: 'Christmas Card to My Family',
    role: 'Designer and developer, a gift for my family',
    year: 2026,
    tools: ['HTML', 'CSS', 'JavaScript', 'Web Audio API'],
    description:
      'A heartfelt Christmas card that doubles as a menu of the dishes I’ll cook when I’m home. Sent as a text, a sealed envelope opens into a letter that writes itself word by word, with a pen nib, scratchy pen sounds and a pace slow enough for my parents to read along. Built for phones in plain HTML, CSS and JavaScript, with sounds made live through the Web Audio API and hosted on Vercel. A pen button opens a request card where each family member taps their face and asks for a dish, and Web3Forms emails the request to me the moment they send it.',
    formats: ['Envelope', 'Letter', 'Menu', 'Request a dish'],
    images: [
      {
        src: 'menu-letter-envelope.webp',
        alt: 'Phone screen on dark green: “you’ve got mail!” in cream handwriting above a cream envelope sealed with a red wax “C”, addressed to Mom, Dad & Bella from Caco, with a heart stamp.',
      },
      {
        src: 'menu-letter-letter.webp',
        alt: 'The opened letter on dotted cream paper: a taped cartoon sticker of Caco above “Dear Mom, Dad & Bella,” in red script, typewriter-style paragraphs about coming home in December to cook, and a yellow “request a dish” pen button in the corner.',
      },
      {
        src: 'menu-letter-menu.webp',
        alt: 'The menu section of the letter: “the menu” in green script, an Appetizers heading in red with an orange underline, and dishes like Brussels sprouts, artichoke dip, deviled eggs and tomato soup, each with a joke note in blue handwriting.',
      },
      {
        src: 'menu-letter-request.webp',
        alt: 'The request card sliding up over the menu, asking “who’s asking?” with cartoon stickers of Dad, Mom and Bella to tap.',
      },
    ],
    link: { label: 'Open the letter', href: 'https://menuforero.vercel.app' },
  },
  {
    title: 'HTML/CSS Workshop',
    role: 'Designer, for Code ReSolve',
    year: 2024,
    tools: ['Canva'],
    description:
      'One workshop in three formats: a print poster for campus boards, a 4:5 Instagram post and a 9:16 Story, each laid out for its size rather than cropped from the poster.',
    formats: ['Print poster', 'Instagram post', 'Instagram Story'],
    images: [
      {
        src: 'html-css-poster.webp',
        alt: 'HTML/CSS Workshop print poster in lavender and black on a grid-paper background: the Code ReSolve logo between angle brackets, a photo of the host waving with an RSVP badge, the date (23 October 2024), time (free hour) and place (Campbell Dome), and a QR code.',
      },
      {
        src: 'html-css-feed.webp',
        alt: 'The HTML/CSS Workshop graphic laid out for a 4:5 Instagram post, with the same title, photo and event details.',
      },
      {
        src: 'html-css-story.webp',
        alt: 'The HTML/CSS Workshop graphic laid out for a 9:16 Instagram Story, with the title and details stacked in a narrower column.',
      },
    ],
  },
  {
    title: 'Data Science / ML Workshop',
    role: 'Designer, for D.I.C.E',
    year: 2024,
    tools: ['Canva'],
    description:
      'A workshop poster built around a stock-chart backdrop, the speaker’s photo and two QR codes, one to sign up and one for LinkedIn, with time and room set large enough to read from across a hallway.',
    images: [
      {
        src: 'data-science-poster.webp',
        alt: 'Data Science / ML Workshop poster: a bright chart graphic behind the title, the D.I.C.E club logo, a photo of the speaker in a Queens College shirt, sign-up and LinkedIn QR codes, and the date (11/20/24), time (12:15–1:30 PM) and room (PH-112, Powdermaker Hall).',
      },
    ],
  },
  {
    title: 'Cybersecurity Certifications 101',
    role: 'Designer, for ISACA',
    tools: ['Canva'],
    description:
      'A light, typographic poster for a certifications session: the question that hooks the audience up top, time, location and date as a three-column row, and an RSVP QR code beside what’s on offer.',
    images: [
      {
        src: 'cyber-security.webp',
        alt: 'Cybersecurity Certifications 101 poster on pale blue: “Looking to start your cybersecurity certification journey?”, the ISACA logo, time (free hour), location (Powdermaker 114) and date (September 29th) in three columns, an RSVP QR code, and food, drinks and prizes.',
      },
    ],
  },
  {
    title: 'Game Day',
    role: 'Designer, for Code ReSolve',
    tools: ['Canva'],
    description:
      'A playful club social: an oversized “G” traced as a game-board path, with cards, dice, chess pieces and a tilted checkerboard around it, reflowed for each format; the square post trades the QR code for a raffle-prizes line.',
    formats: ['Print poster', 'Instagram post', 'Instagram Story'],
    images: [
      {
        src: 'game-night-poster.webp',
        alt: 'Code Resolve Game Day poster on dark purple: “Game” in bold lavender with a teal game-board path forming the G, “Day” in cream script, playing cards, dice and chess pieces around it, a checkerboard in the lower left, the place (Powdermaker 114) and time (free hour, 12–1:30 PM), September 23rd and a QR code.',
      },
      {
        src: 'game-night-feed.webp',
        alt: 'The Game Day graphic laid out as a square Instagram post, adding raffle prizes to the board and card games, with “September 23rd” set large on a lavender wave.',
      },
      {
        src: 'game-night-story.webp',
        alt: 'The Game Day graphic laid out for a 9:16 Instagram Story, with the checkerboard running down the left and the QR code beside the date.',
      },
    ],
  },
  {
    title: 'LeetCode Workshop',
    role: 'Designer, for Code ReSolve',
    year: 2024,
    tools: ['Canva'],
    description:
      'An editorial, Swiss-style poster: outlined lavender display type over a honeycomb motif, with the event split into a ruled grid of pitch, QR code, club logo and host photo.',
    images: [
      {
        src: 'leetcode-poster.webp',
        alt: 'LeetCode Workshop poster on off-white: “Leet Code Workshop” in outlined lavender letters beside a hexagon pattern, a blue panel reading “Stay ahead of the game, ace the interview”, a QR code, the Code ReSolve logo, a photo of host Kevin Bedoya, and the place (Campbell Dome), date (October 30, 2024) and time (12–1:30 PM).',
      },
    ],
  },
  {
    title: 'Resume Building Workshop',
    role: 'Designer, for Code ReSolve',
    year: 2024,
    tools: ['Canva'],
    description:
      'A speaker-led poster: a large circular portrait of the guest speaker anchors the left, with the reasons to come and the event details stacked in a right-aligned column.',
    images: [
      {
        src: 'resume-workshop.webp',
        alt: 'Resume Building Workshop poster in navy, steel blue and lavender: the Code ReSolve logo, a circular portrait of guest speaker Shawn D. Rajukumar in a suit, the UBIQ logo, a “Why come” list (beginner-friendly advice, tips and tricks, boosting your resume), free hour on 13 November 2024 in Powdermaker Hall 141, and a follow-us QR code.',
      },
    ],
  },
  {
    title: 'Art of Programming Languages',
    role: 'Designer, for Code ReSolve',
    year: 2025,
    tools: ['Canva'],
    description:
      'A workshop promo built around a glossy code-editor icon and the club logo, in a print poster and a 4:5 Instagram post.',
    formats: ['Print poster', 'Instagram post'],
    images: [
      {
        src: 'programming-languages-poster.webp',
        alt: 'Art of Programming Languages workshop poster on deep indigo: a purple code-editor icon overlapping the Code ReSolve logo on the left, the title and “with Code Resolve” on the right, 3 March 2025, 12–1:30 PM in PH 118, and a QR code.',
      },
      {
        src: 'programming-languages-feed.webp',
        alt: 'The Art of Programming Languages graphic laid out for a 4:5 Instagram post, with the same logo, code-editor icon, title, date and QR code.',
      },
    ],
  },
  {
    title: 'Python for Beginners',
    role: 'Designer, for Code ReSolve',
    year: 2024,
    tools: ['Canva'],
    description:
      'A bright, friendly poster for an intro workshop, using the Python logo’s blue and yellow as the whole palette.',
    images: [
      {
        src: 'python-beginners.webp',
        alt: 'Python for Beginners poster on white: the title in black on blue and yellow pills, the Python logo, hosts Nicole and Emily Haller, April 2nd 2024, 12:15–1:30 PM on Zoom, the Code ReSolve logo, a “Register now!” speech bubble over a QR code, and a bit.ly registration link.',
      },
    ],
  },
  {
    title: 'Code 4 a Cause',
    role: 'Designer, for Code ReSolve',
    year: 2025,
    tools: ['Canva'],
    description:
      'A pixel-art concept for a charity coding event: an 8-bit Queens skyline with hearts, fireworks and a cursor clicking the title. An early draft, with the date and venue still to be filled in.',
    images: [
      {
        src: 'code-4-a-cause.webp',
        alt: 'Code 4 a Cause pixel-art poster on violet: the title in white 8-bit letters under five hearts, “April __, 2025, at some place in QC”, an empty frame for a QR code, fireworks and clouds, and a pixel city skyline above green bushes with a small cat in the corner.',
      },
    ],
  },
]
