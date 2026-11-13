#!/usr/bin/env node
/**
 * Builds the optimized case-study media in public/work/<slug>/ from the raw
 * originals in portfolio-assets/<slug>/ (git-ignored), then writes
 * src/content/work/assets.manifest.json with every file's pixel size.
 *
 * The manifest is what the case-study pages trust: an image that isn't listed
 * is treated as missing and never rendered, and listed images get explicit
 * width/height so nothing shifts while they load.
 *
 *   node scripts/build-work-assets.mjs            # every case study
 *   node scripts/build-work-assets.mjs hackknight # one
 *
 * Needs pdftoppm (brew install poppler), ffmpeg, ffprobe and cwebp on PATH.
 *
 * Per slug:
 *  - PDF pages listed in PDF_PAGES are rendered and cut into named images.
 *  - Any other .png/.jpg/.jpeg/.webp/.heic in the folder → <name>.webp.
 *  - Any .mov/.mp4/.m4v/.webm → <name>.mp4 (H.264, no audio) + <name>-poster.webp.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, extname, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const RAW = join(ROOT, 'portfolio-assets')
const OUT = join(ROOT, 'public/work')
const MANIFEST = join(ROOT, 'src/content/work/assets.manifest.json')

const MAX_IMAGE_WIDTH = 2000
const MAX_IMAGE_BYTES = 400 * 1024
const MAX_VIDEO_WIDTH = 1280
const MAX_VIDEO_BYTES = 4 * 1024 * 1024

/**
 * Images cut from a case study's PDF. `pages` are 1-based. More than one page
 * is laid side by side. `crop` is a fraction of the (combined) page:
 * [x, y, width, height].
 */
const PDF_PAGES = {
  'code-for-all': {
    pdf: 'brand-guide.pdf',
    images: {
      cover: { pages: [1] },
      'logo-before-after': { pages: [6] },
      'old-logo': { pages: [6], crop: [0.155, 0.245, 0.3, 0.485] },
      'cody-variations': { pages: [8] },
      'logo-variations': { pages: [9] },
      'favicon-scale': { pages: [10] },
      'type-and-color': { pages: [17, 18] },
      'in-practice': { pages: [19] },
      'guidelines-spread': { pages: [9, 17, 18] },
    },
  },
}

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.heic'])
const VIDEO_EXT = new Set(['.mov', '.mp4', '.m4v', '.webm'])

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString()
const kb = (file) => `${Math.round(statSync(file).size / 1024)} KB`

/** PNG → WebP, stepping quality down until it fits the size budget. */
function toWebp(input, output) {
  for (const quality of [82, 74, 66, 58, 50]) {
    run('cwebp', ['-quiet', '-q', String(quality), '-m', '6', '-resize', '0', '0', input, '-o', output])
    if (statSync(output).size <= MAX_IMAGE_BYTES) return
  }
  console.warn(`  ! ${basename(output)} is still ${kb(output)} at the lowest quality`)
}

/** Any image → PNG no wider than MAX_IMAGE_WIDTH, via ffmpeg (handles HEIC/JPEG/PNG/WebP). */
function normalize(input, output, filters = []) {
  const vf = [...filters, `scale='min(${MAX_IMAGE_WIDTH},iw)':-2:flags=lanczos`].join(',')
  run('ffmpeg', ['-loglevel', 'error', '-y', '-i', input, '-vf', vf, '-frames:v', '1', output])
}

function buildPdfImages(slug, tmp) {
  const spec = PDF_PAGES[slug]
  if (!spec) return
  const pdf = join(RAW, slug, spec.pdf)
  if (!existsSync(pdf)) return console.warn(`  ! ${spec.pdf} not found, skipping PDF images`)

  const pagePng = (page) => {
    const prefix = join(tmp, `page-${page}`)
    if (!existsSync(`${prefix}.png`)) {
      run('pdftoppm', ['-f', String(page), '-l', String(page), '-png', '-singlefile', '-scale-to-x', String(MAX_IMAGE_WIDTH), '-scale-to-y', '-1', pdf, prefix])
    }
    return `${prefix}.png`
  }

  for (const [name, { pages, crop }] of Object.entries(spec.images)) {
    const inputs = pages.flatMap((p) => ['-i', pagePng(p)])
    const filters = []
    if (pages.length > 1) filters.push(`${pages.map((_, i) => `[${i}:v]`).join('')}hstack=inputs=${pages.length}`)
    if (crop) filters.push(`crop=iw*${crop[2]}:ih*${crop[3]}:iw*${crop[0]}:ih*${crop[1]}`)
    filters.push(`scale='min(${MAX_IMAGE_WIDTH},iw)':-2:flags=lanczos`)
    const png = join(tmp, `${name}.png`)
    run('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', filters.join(','), '-frames:v', '1', png])
    const out = join(OUT, slug, `${name}.webp`)
    toWebp(png, out)
    console.log(`  ${name}.webp  ${kb(out)}  (PDF p.${pages.join('+')})`)
  }
}

function buildVideo(slug, file, tmp) {
  const name = basename(file, extname(file))
  const out = join(OUT, slug, `${name}.mp4`)
  for (const crf of [26, 29, 32, 35]) {
    run('ffmpeg', [
      '-loglevel', 'error', '-y', '-i', file, '-an',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf), '-pix_fmt', 'yuv420p',
      '-vf', `scale='min(${MAX_VIDEO_WIDTH},iw)':-2`, '-movflags', '+faststart', out,
    ])
    if (statSync(out).size <= MAX_VIDEO_BYTES) break
  }
  if (statSync(out).size > MAX_VIDEO_BYTES) console.warn(`  ! ${name}.mp4 is still ${kb(out)}; trim the clip`)

  const posterPng = join(tmp, `${name}-poster.png`)
  run('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '1', '-i', out, '-frames:v', '1', posterPng])
  toWebp(posterPng, join(OUT, slug, `${name}-poster.webp`))
  console.log(`  ${name}.mp4  ${kb(out)}  + ${name}-poster.webp`)
}

/** 1200×630 JPEG of the cover for link previews (og:image); not every scraper reads WebP. */
function buildOgImage(slug) {
  const cover = join(OUT, slug, 'cover.webp')
  if (!existsSync(cover)) return
  const out = join(OUT, slug, 'og.jpg')
  run('ffmpeg', ['-loglevel', 'error', '-y', '-i', cover, '-vf', 'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630', '-q:v', '3', out])
  console.log(`  og.jpg  ${kb(out)}`)
}

function buildSlug(slug) {
  console.log(slug)
  mkdirSync(join(OUT, slug), { recursive: true })
  const tmp = mkdtempSync(join(tmpdir(), `work-${slug}-`))
  try {
    buildPdfImages(slug, tmp)
    for (const entry of readdirSync(join(RAW, slug))) {
      const file = join(RAW, slug, entry)
      const ext = extname(entry).toLowerCase()
      const name = basename(entry, extname(entry))
      if (VIDEO_EXT.has(ext)) buildVideo(slug, file, tmp)
      else if (IMAGE_EXT.has(ext)) {
        const png = join(tmp, `${name}.png`)
        normalize(file, png)
        const out = join(OUT, slug, `${name}.webp`)
        toWebp(png, out)
        console.log(`  ${name}.webp  ${kb(out)}`)
      }
    }
    buildOgImage(slug)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

/** Pixel size of every published file, keyed "<slug>/<file>". */
function writeManifest() {
  const manifest = {}
  for (const slug of readdirSync(OUT).sort()) {
    const dir = join(OUT, slug)
    if (!statSync(dir).isDirectory()) continue
    for (const file of readdirSync(dir).sort()) {
      if (!/\.(webp|mp4)$/.test(file)) continue
      const [width, height] = run('ffprobe', [
        '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', join(dir, file),
      ]).trim().split('x').map(Number)
      manifest[`${slug}/${file}`] = { width, height }
    }
  }
  mkdirSync(join(ROOT, 'src/content/work'), { recursive: true })
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`manifest: ${Object.keys(manifest).length} files → ${MANIFEST.replace(`${ROOT}/`, '')}`)
}

const slugs = process.argv.slice(2)
const all = existsSync(RAW) ? readdirSync(RAW).filter((d) => statSync(join(RAW, d)).isDirectory()) : []
for (const slug of slugs.length ? slugs : all) buildSlug(slug)
writeManifest()
