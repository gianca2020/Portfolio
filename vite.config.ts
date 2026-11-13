import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { homeMeta, prerenderedRoutes, renderMetaTags, SITE_URL } from './src/lib/siteMeta.ts'

const META_BLOCK = /<!-- route-meta -->[\s\S]*?<!-- \/route-meta -->/

/**
 * Per-route <head> tags without a server: index.html gets the iPod's tags, and
 * each other route gets a copy of the built index.html at dist/<route>/index.html
 * with its own title, description and Open Graph tags. Vercel serves those
 * files before the SPA rewrite in vercel.json, so link previews are right.
 * Also writes sitemap.xml with the same routes.
 */
function routeMeta(): Plugin {
  let outDir = 'dist'
  const block = (tags: string) => `<!-- route-meta -->\n    ${tags}\n    <!-- /route-meta -->`
  return {
    name: 'route-meta',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir)
    },
    transformIndexHtml(html) {
      return html.replace(META_BLOCK, block(renderMetaTags(homeMeta)))
    },
    closeBundle() {
      const html = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const meta of prerenderedRoutes()) {
        const dir = join(outDir, meta.path)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), html.replace(META_BLOCK, block(renderMetaTags(meta))))
      }
      const urls = [homeMeta, ...prerenderedRoutes()].map((meta) => `  <url><loc>${SITE_URL}${meta.path}</loc></url>`)
      writeFileSync(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), routeMeta()],
})
