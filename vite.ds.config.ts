import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

/**
 * Builds the Design System artifact bundle: ONE classic IIFE script that reads
 * React 18 from `window.React` / `window.ReactDOM` and assigns
 * `window.GFIpod = { …components }`, plus its stylesheet.
 *
 *   npx vite build --config vite.ds.config.ts
 */
const shim = fileURLToPath(new URL('./src/design-system/jsx-runtime-shim.ts', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^react\/jsx-runtime$/, replacement: shim },
      { find: /^react\/jsx-dev-runtime$/, replacement: shim },
    ],
  },
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'design-system-dist',
    emptyOutDir: true,
    copyPublicDir: false,
    cssCodeSplit: false,
    minify: true,
    lib: {
      entry: fileURLToPath(new URL('./src/design-system/index.ts', import.meta.url)),
      name: 'GFIpod',
      formats: ['iife'],
      fileName: () => 'bundle.js',
      cssFileName: 'bundle',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM', 'react-dom/client': 'ReactDOM' },
      },
    },
  },
})
