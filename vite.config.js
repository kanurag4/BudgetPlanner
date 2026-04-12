import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When deploying to GitHub Pages the site lives at /repo-name/.
// Set VITE_BASE_PATH in your repo's Actions secrets/vars, or leave it
// unset for local dev (defaults to '/').
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/components/**'],
    },
  },
})
