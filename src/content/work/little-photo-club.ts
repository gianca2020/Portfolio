import type { CaseStudy } from './types.ts'

export const littlePhotoClub: CaseStudy = {
  slug: 'little-photo-club',
  published: true,
  title: 'Little Photo Club',
  summary:
    'For a party at a local school club, I turned my laptop into the camera for a tiny DIY photobooth. I designed and built a browser prototype where a group squeezes into a portrait, takes four photos, and picks up a strip from a pixel dispenser.',
  cover: {
    type: 'image',
    src: 'cover.webp',
    alt: 'The Little Photo Club guest setup screen in 1-bit pixel art: four characters crowded into one frame, a man in a backwards cap, a woman with bangs and hoop earrings, a messy-haired baby with star eyes and a black cat peeking over the top, with orange burst lines around them.',
  },
  snapshot: {
    role: 'I drew the four characters, designed the booth interface, and built the working browser prototype.',
    team: 'Solo project',
    timeline: '2022 – Nov 2026 · started in 2022, refined in 25 numbered versions',
    tools: ['HTML', 'CSS', 'JavaScript', 'Canvas', 'Web Audio'],
    platforms: ['Web (desktop browser)'],
    metrics: [
      { value: '1–4', label: 'guests per strip' },
      { value: '4', label: 'photos per strip' },
    ],
  },
  problem:
    'I started this in 2022 when I wanted to join the school clubs, and came back to refine it in November 2026.\n\nWe turned a tiny room into a photobooth. My laptop was the only thing inside. The setup called for someone to print and cut the downloaded strips as people left. My part was everything the group would see and hear on that laptop.\n\nThe club loves Nintendo. I wanted the wait for a picture to have some of the excitement of a real booth, and pressing a button to feel like a memory of playing on a Nintendo handheld.',
  users: [
    {
      name: 'School club party guests',
      description:
        'I designed for one to four people sharing a laptop camera at the party. I wanted them to have a little fun figuring out who they were in the group portrait before they posed for their own strip.',
    },
  ],
  decisions: [
    {
      title: 'Give the fourth spot to the cat',
      why:
        'I considered drawing a fourth person. Four is already a squeeze in a photobooth, so I gave the last spot to a cat inspired by Takkun. I drew people of different ages and genders because I wanted guests to find someone in the cast they could identify with.\n\nWhen someone presses +1, the whole portrait changes. The man starts out alone. By the fourth spot, the cat is peeking over everyone and the baby has stars for eyes. I wanted choosing the group size to feel like part of taking the picture.',
      media: {
        type: 'image',
        src: 'cast-assembles.webp',
        alt: 'Four group portraits, from the man alone to the cat peeking over the man, woman, and star-eyed baby.',
      },
      caption: 'One to four guests. When the cat squeezes into the frame, everyone’s expression changes.',
    },
    {
      title: 'Bring the screen into the cast’s ink',
      why:
        'I drew the character sheets one at a time before starting the booth screens. The first rough cuts still had a curly-haired doodle in the frame. The man in the backwards cap first appeared there in v4.\n\nBy draft 12 the floor was dithered and the buttons had hard shadows, but the portrait was still smooth and tilted. I wanted it to look like it belonged in the same Flipnote world. In the second draft 13, I straightened the frame and changed the portrait to 1-bit.',
      media: {
        type: 'image',
        src: 'portrait-before-after.webp',
        alt: 'The same portrait in draft 12 and the second draft 13. A smooth illustration in a tilted frame becomes 1-bit art in a straight frame with a hard shadow.',
      },
      caption: 'Draft 12, left, and the second draft 13, right. Look at the edge of the cap and the shadow under the frame.',
    },
    {
      title: 'Simplify the walk into a hop',
      why:
        'My first walker had a face, a shirt, and a cap. I wanted a simpler shape that would be easy to animate and still recognizable. I tried a stick figure, then settled on little black silhouettes that hop through the orange curtain one by one. You can still pick out the first guest by the brim of the cap.',
      media: {
        type: 'image',
        src: 'booth-sequence.webp',
        alt: 'Three entrances show a clothed walker, a thin stick figure, and a rounded black silhouette with a cap brim approaching an orange curtain.',
      },
      caption: 'The entrance in drafts 21, 22, and 27. The face and shirt disappear. The brim is still visible in profile.',
    },
    {
      title: 'Make guests wait for the strip',
      why:
        'Even the early orange dispenser made you pick up your strip. What I changed was the wait. In the last two drafts, the paper feeds out in little steps, with the print sound timed to the movement. Then it drops and sits there until you pick it up.\n\nI wanted that little stretch of excitement you get at a real booth when the photos are nearly yours. Picking up the strip opens it at full size so you get a good look at all four frames before you decorate them or decide to try again.',
      media: {
        type: 'image',
        src: 'reveal-before-after.webp',
        alt: 'Left, an orange vector dispenser holds a four-frame strip. Right, the strip rests below the slot of a pixel dispenser with a PHOTOS sign.',
      },
      caption: 'The early dispenser already had a pickup. In the final version the strip feeds out, lands, and waits for you.',
    },
  ],
  process: [
    {
      label: 'Draw the four character sheets',
      src: 'cast-sheets.webp',
      alt: 'Character studies for the man, woman, baby, and cat, with expressions, poses, and a shared black, halftone, and orange palette.',
    },
    {
      label: 'Place the cast in the fourth rough cut',
      src: 'rough-cuts.webp',
      alt: 'The guest screen in v1, v3, and v4. A curly-haired doodle appears in the first two screens, then gives way to the man in the backwards cap.',
    },
    {
      label: 'Give the camera its DSi-inspired controls',
      src: 'camera-before-after.webp',
      alt: 'Two demo viewfinders. Draft 07 shows a doodle face above a capture button. Draft 27 shows the guest in a backwards cap inside a pixel camera with filter, graffiti, and doodle controls.',
    },
  ],
  finalDesign: {
    text:
      'I borrowed Distortion and Mischief from the DSi Camera lenses and made Flipnote Ink a nod to the drawing app. I used Web Audio for the pop when someone joins, the shutter, and the sound of the strip sliding out. Unmute the clip to hear the printer as the strip feeds out, lands, and opens at full size when I pick it up. The email screen is simulated.',
    media: [
      {
        type: 'video',
        src: 'strip-pickup.mp4',
        alt: 'In demo view, the strip feeds out to the printer sound, lands, and opens at full size when clicked.',
      },
    ],
  },
  links: [
    { label: 'DSi Camera manual · Distortion lens', href: 'https://www.manualsdir.com/manuals/193570/nintendo-dsi.html?page=16' },
    { label: 'DSi Camera manual · Mischief lens', href: 'https://www.manualsdir.com/manuals/193570/nintendo-dsi.html?page=17' },
  ],
  outcome:
    'I finished the v1 design in draft 27 and built the full flow as a working browser prototype. I’ve tried it myself. It will be shared with users next, so I don’t have usage numbers yet.',
  reflection:
    'Next time I’d bring the booth to the club as soon as a group could add themselves and take a strip. I spent several drafts working out how the characters should walk or hop through the curtain. I’d try the group portrait with people before spending that time on the entrance.\n\nI’d watch what happens when the fourth guest presses +1 and the cat appears. Does anyone claim the cat as theirs without me suggesting it? Do they ask how the characters know each other? Those are two things I can listen for while everyone is still gathered around the laptop.',
}
