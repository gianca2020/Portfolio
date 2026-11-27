import type { CaseStudy } from './types.ts'

/*
 * Drafted from 25 numbered HTML prototypes (rough cuts v1–v6 and drafts 07–27,
 * Nov 25–26, 2026; v5 and draft 14 were never recovered), the four character
 * sheets and the Figma case-study board. Draft 27 is the final design. Screens
 * are Chrome captures at 1280×800; the camera images use the app's own "demo
 * view" so no webcam feed is shown. Reasons are written where Giancarlo has
 * said them (portrait, camera, click feel); the reveal's reasoning is the
 * developer's inference from the code and was accepted for now; the booth
 * entrance and print animation are described from what the drafts show.
 * Sourced figures: DSi 41M+ units (Nintendo, via Wikipedia), 44M Flipnotes
 * archived (Nintendo Life), photobooth revival (The Week).
 * Still to do before flipping `published` to true:
 *  - reflection (hidden while 'TODO')
 *  - a Figma link in `links` once the board is shared
 * Unpublished until then.
 */
export const littlePhotoClub: CaseStudy = {
  slug: 'little-photo-club',
  published: false,
  title: 'Little Photo Club',
  summary:
    'A nostalgic photobooth for the browser, built around a cast of four characters. Guests step in as the cast, take a four-frame strip and pick it up from a pixel dispenser. The cast’s halftone ink set the look of everything else.',
  cover: {
    type: 'image',
    src: 'cover.webp',
    alt: 'The Little Photo Club guest setup screen in 1-bit pixel art: four characters crowded into one frame, a man in a backwards cap, a woman with bangs and hoop earrings, a messy-haired baby with star eyes and a black cat peeking over the top, with orange burst lines around them.',
  },
  snapshot: {
    role: 'Lead designer. I designed and built all of it myself: the characters, the interface and the working prototype.',
    team: 'Solo project',
    timeline: 'Nov 25–26, 2026 · 25 numbered versions',
    tools: ['HTML', 'CSS', 'JavaScript', 'Canvas', 'Web Audio'],
    platforms: ['Web (desktop browser)'],
    metrics: [
      { value: '4', label: 'characters' },
      { value: '25', label: 'numbered versions' },
      { value: '7', label: 'screens, start to finish' },
      { value: '1–4', label: 'guests per strip' },
    ],
  },
  problem:
    'A photo strip is a small souvenir, and the physical booth is a nostalgic object: you put a coin in, step inside, pose, and wait for the strip to drop. Most of that is lost when a photobooth becomes a camera button on a web page.\n\nI wanted a browser photobooth that keeps the feeling of a place you’ve been, and one that guests could put themselves into, so that they remember it afterward.',
  users: [
    {
      name: 'Guests',
      description:
        'One to four people stepping in together. They choose how many are in the booth, add their names and take a strip. They need to understand it instantly and want a reason to remember it.',
    },
  ],
  decisions: [
    {
      title: 'Draw the cast first, then build the booth around it',
      why:
        'The four characters were designed as a set before the product took its look: a man, a woman, a baby and a cat, each on a sheet with expressions, back views, eye studies and a three-part palette. Black ink, halftone dots and one orange accent, with orange burst lines carrying the emotion.\n\nThat system shaped the pixel direction of the whole product. Later screens didn’t get a style of their own, they had to match the cast.',
      media: {
        type: 'image',
        src: 'cast-sheets.webp',
        alt: 'Four character sheets in a grid. Top left: a man with a backwards cap in four expressions plus side and back views. Top right: a woman with bangs and hoops in three expressions. Bottom left: a messy-haired baby, deadpan and star-eyed. Bottom right: a black cat with big eyes and orange burst marks.',
      },
      caption: 'The four character sheets: one ink, one halftone, one orange.',
    },
    {
      title: 'Let guests step in as the cast',
      why:
        'The booth is where a guest becomes a character. One guest is the man; adding a second brings in the woman, a third brings the baby, and a fourth lets the cat jump in. Each guest also gets a name field, and the characters change expression as the group grows.\n\nThe goal is self-insertion: the story of the strip belongs to whoever is in it, which is meant to make the project easier to remember.',
      media: {
        type: 'image',
        src: 'cast-assembles.webp',
        alt: 'Four versions of the guest setup screen side by side. One guest shows the man alone; two adds the woman; three adds the baby; four adds the cat, with the +1 button disabled.',
      },
      caption: 'One to four guests: the cast assembles as the group grows.',
    },
    {
      title: 'Start rough, then swap in the cast',
      why:
        'The first rough cuts already had the whole flow, from welcome to email, but the guest portrait was a generic curly-haired doodle on a cream page with handwritten copy. The page went white by v2, and in v4 the cast’s man replaced the doodle.\n\nThe six-scene flow was there from the first cut and only gained the coin screen later. What kept changing was the look.',
      media: {
        type: 'image',
        src: 'rough-cuts.webp',
        alt: 'Three guest setup screens side by side. Left, rough cut v1: a cream page, the headline “Room for one more?” and a curly-haired doodle in a tilted frame. Middle, v3: the same doodle on a white page. Right, v4: the cast’s man in a backwards cap in the same frame.',
      },
      caption: 'The guest screen in rough cut v1 (left), v3 (middle) and v4 (right).',
    },
    {
      title: 'Pull the whole interface into the characters’ ink',
      why:
        'Draft 07 already used the character art, but around it the interface was smooth: a marker-script “Welcome!”, a line-art camera and a plain white page. Over drafts 08 to 11 the world moved into the cast’s halftone language. A dot-dither floor replaced the blank page, “Welcome” became pixelated handwriting that writes itself on, and a dithered pixel camera with an orange accent replaced the line-art one. Draft 09 also added a pixel coin as a launch screen in front of everything.',
      media: {
        type: 'image',
        src: 'welcome-before-after.webp',
        alt: 'Two welcome screens side by side. Left, draft 07: a smooth marker “Welcome!” with a line-art camera on white. Right, draft 11: a dithered pixel camera with an orange base on a dot-dither floor.',
      },
      caption: 'The welcome screen, draft 07 (left) and draft 11 (right).',
    },
    {
      title: 'Make the character itself 1-bit',
      why:
        'Through draft 12 the portrait on the guest screen was the smooth illustration, tilted in a frame, and the first Draft 13 still had it. In the second Draft 13 it becomes a straight, hard-edged 1-bit image in a frame with a hard drop shadow.\n\nThe reason was visual cohesion. I wanted the whole app to map to one nostalgic Flipnote-style look, and a smooth, tilted illustration sitting in a pixel world broke it. The file size also fell from about 7MB to about 400KB in that draft.',
      media: {
        type: 'image',
        src: 'portrait-before-after.webp',
        alt: 'Two guest setup screens side by side. Left, draft 12: a smooth, tilted character portrait. Right, the second Draft 13: the same portrait as straight, hard-edged 1-bit art with a drop shadow.',
      },
      caption: 'The guest portrait, draft 12 (left) and the second Draft 13 (right).',
    },
    {
      title: 'Turn the camera into an arcade booth',
      why:
        'In draft 07 the camera step was a video box with two plain buttons. By draft 27 it sits inside a camera housing, with a bar of six filters, a doodle frame option and a graffiti mode for drawing on the photos afterward. The demo view, used here so no one’s face appears, shows the same character in both drafts: a generic doodle at first, then the cast in 1-bit.\n\nThe fun of this app is merging two things people already love. Photobooths are having a revival, with young people flocking back to them. The Nintendo DSi sold over 41 million units, and its camera came with playful “lens” effects. The filters echo that on purpose: Distortion and Mischief are named after DSi Camera lenses, and Flipnote Ink nods to Flipnote Studio, the DSi drawing app whose fan-built archive holds about 44 million Flipnotes.',
      media: {
        type: 'image',
        src: 'camera-before-after.webp',
        alt: 'Two camera screens side by side. Left, draft 07: a simple doodle face in a plain frame with a Take photos button. Right, draft 27: a pixel camera housing, a row of filter icons, a 1-bit character in the viewfinder and extra Graffiti and Doodle frame buttons.',
      },
      caption: 'The camera step in demo view, draft 07 (left) and draft 27 (right).',
    },
    {
      title: 'Hop into the booth',
      why:
        'The beat between choosing the group and posing is a short animation of the guests entering the booth, which can be skipped. In draft 21 it was a single character walking toward a dark doorway. Over drafts 22 to 25 I rebuilt it: a redesigned booth with a PHOTOS sign and an orange curtain, and little black silhouettes that hop in one by one.',
      media: {
        type: 'image',
        src: 'booth-sequence.webp',
        alt: 'Three booth-entrance screens side by side, all captioned “Mind your elbows!”. Left, draft 21: a pixel character walking toward a dark booth. Middle, draft 22: a stick-figure silhouette approaching a redesigned booth with an orange PHOTOS sign. Right, draft 27: a small round silhouette next to the booth, which now has an orange curtain.',
      },
      caption: 'The booth entrance: draft 21 (left), draft 22 (middle) and draft 27 (right).',
    },
    {
      title: 'Make the reveal a moment',
      why:
        'The strip never just appears. In every draft the reveal is a dispenser: the strip waits in the slot, and the guest has to pick it up, which is when the sound plays and the photos open. As the developer I treated that as a deliberate gate. Showing the result straight away would make the booth a photo viewer, but one click target at the slot turns it into a hand-off, the pause a real booth gives you before the strip drops.\n\nAfter the pickup there’s a second gate: a “Keep it, or shall we try again?” choice before the email step, so a guest never sends a photo they haven’t approved. What changed between draft 07 and draft 27 is the art and the motion. The orange vector booth with a recessed slot became a larger pixel dispenser with a PHOTOS sign.',
      media: {
        type: 'image',
        src: 'reveal-before-after.webp',
        alt: 'Two reveal screens side by side. Left, draft 07: a four-frame strip inside an orange vector photobooth with a recessed photo slot. Right, draft 27: the strip in a large pixel photo dispenser with a PHOTOS sign.',
      },
      caption: 'The reveal, draft 07 (left) and draft 27 (right).',
    },
    {
      title: 'Let the strip print, then show it full size',
      why:
        'In drafts 26 and 27 the strip stops sitting in the slot and is released from the dispenser and lands, drawn on 12 fps holds so the motion steps like a flipbook, with the print sound kept in time. The pause while it prints is the closest the screen gets to waiting at a real booth.\n\nWhen the guest picks it up, the review now shows the strip at full size instead of a small thumbnail, so the photos are the focus before the guest decides whether to send them.',
      media: {
        type: 'image',
        src: 'print-sequence.webp',
        alt: 'Three reveal screens side by side. Left, draft 21: a small four-frame strip centered on the review screen with a Graffiti button. Middle, draft 27: the dispenser with the first frames of the strip just emerging from the slot. Right, draft 27: the strip at full size, filling most of the screen height.',
      },
      caption: 'The review in draft 21 (left), the strip printing in draft 27 (middle) and the full-size review in draft 27 (right).',
    },
    {
      title: 'Make every click answer back',
      why:
        'The goal is for every click to feel like a memory of Nintendo: pressing a button on a handheld you used to own. Buttons are chunky with hard drop shadows, and the sounds are synthesized in the browser with Web Audio: a pop when a guest joins, a shutter when a photo is taken and a slide as the strip comes out.',
    },
  ],
  process: [
    {
      label: 'Insert coin',
      src: 'flow-coin.webp',
      alt: 'The launch screen: a pixel coin with an orange edge on a dot-dither floor.',
    },
    {
      label: 'Welcome',
      src: 'flow-welcome.webp',
      alt: 'The welcome screen: a dithered pixel camera with an orange base on a dot-dither floor.',
    },
    {
      label: 'Guests',
      src: 'flow-setup.webp',
      alt: 'The guest setup screen with one guest: the man in a backwards cap in a framed portrait, minus and plus buttons, a name field and a Step inside button.',
    },
    {
      label: 'Enter the booth',
      src: 'flow-booth.webp',
      alt: 'The booth entrance in draft 27: a small silhouette hopping toward a pixel photobooth with an orange curtain and a PHOTOS sign, and the line “Mind your elbows!”.',
    },
    {
      label: 'Camera',
      src: 'flow-camera.webp',
      alt: 'The camera screen in demo view: a pixel camera housing, a bar of filter icons, a 1-bit character in the viewfinder and a Take photos button.',
    },
    {
      label: 'Reveal',
      src: 'flow-reveal.webp',
      alt: 'The reveal screen in draft 27: a large pixel photo dispenser with an orange PHOTOS sign and the strip waiting in the slot.',
    },
    {
      label: 'Email',
      src: 'flow-email.webp',
      alt: 'The email screen: a hand-drawn envelope with an orange heart, the heading “Special delivery!”, an email field and a Send the photos button.',
    },
  ],
  finalDesign: {
    text:
      'Draft 27 is the final design: seven screens from coin to “Special delivery!”, in the same order since the first rough cut apart from the coin screen added in draft 09. The cast, the dithered floor, the orange accent, the booth-entrance animation and the printing dispenser are all in place. The email step is a prototype: nothing is sent or saved.',
    media: [
      {
        type: 'image',
        src: 'flow-camera.webp',
        alt: 'The camera screen in demo view, with a pixel camera housing, filter icons and a 1-bit character in the viewfinder.',
      },
      {
        type: 'image',
        src: 'flow-reveal.webp',
        alt: 'The reveal screen: a large pixel photo dispenser with the strip waiting in the slot.',
      },
    ],
  },
  links: [
    { label: 'Source: Nintendo DSi sales and camera', href: 'https://en.wikipedia.org/wiki/Nintendo_DSi' },
    { label: 'Source: DSi manual, Distortion lens', href: 'https://www.manualsdir.com/manuals/193570/nintendo-dsi.html?page=16' },
    { label: 'Source: DSi manual, Mischief lens', href: 'https://www.manualsdir.com/manuals/193570/nintendo-dsi.html?page=17' },
    { label: 'Source: 44 million Flipnotes archived', href: 'https://www.nintendolife.com/news/2022/06/flipnote-archive-launches-showcasing-44-million-flipnotes-from-dsi-era' },
    { label: 'Source: Photo booths are having a revival', href: 'https://theweek.com/culture-life/why-photo-booths-are-enjoying-a-revival' },
  ],
  outcome:
    'The design for v1 is finished: draft 27 is the final prototype, and real code comes next. So far only I have used it, so there are no user results to report yet.',
  reflection: 'TODO',
}
