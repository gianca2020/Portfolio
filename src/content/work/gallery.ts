import type { GalleryItem } from './types'

/**
 * One-off design pieces for the /work gallery. Image `src` is a file name in
 * public/work/gallery/. While this list is empty the gallery section is hidden
 * and the iPod doesn't list “More Design Work”.
 *
 * Posters designed in Canva for campus CS clubs. Other exports in
 * portfolio-assets/gallery/ are held back until they're finished: the Code 4 a
 * Cause pair still shows template placeholder text, and the webinar, hackathon
 * prep and ISACA × CodeResolve pieces carry Canva watermarks.
 */
export const gallery: GalleryItem[] = [
  {
    title: 'Christmas Card to My Family',
    role: 'Designer and developer, a gift for my family',
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
    description:
      'A light, typographic poster for a certifications session: the question that hooks the audience up top, time, location and date as a three-column row, and an RSVP QR code beside what’s on offer.',
    images: [
      {
        src: 'cyber-security.webp',
        alt: 'Cybersecurity Certifications 101 poster on pale blue: “Looking to start your cybersecurity certification journey?”, the ISACA logo, time (free hour), location (Powdermaker 114) and date (September 29th) in three columns, an RSVP QR code, and food, drinks and prizes.',
      },
    ],
  },
]
