import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { deckReload } from './scripts/deck-reload.mjs'

export default defineConfig({
  plugins: [deckReload(fileURLToPath(new URL('./slides.md', import.meta.url)))],
  server: { host: '127.0.0.1', strictPort: true },
  preview: {
    host: '127.0.0.1',
    port: 3032,
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; media-src 'none'; frame-src 'none'",
    },
  },
})
