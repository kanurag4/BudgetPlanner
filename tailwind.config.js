/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        // Light-first navy+amber (redesign 2026-08-19) — these reference CSS
        // custom properties declared in index.css, so `primary`/`accent`
        // automatically invert between dark (amber accent) and light (navy
        // accent) mode without needing separate dark: variants per usage.
        // See Kashvector.md's redesign rollout status for the full token table.
        primary: {
          DEFAULT:  'var(--kv-accent)',
          dark:     'var(--kv-accent-h)',
          contrast: 'var(--kv-bg)',   // text color for on-primary-background content
        },
        accent: 'var(--kv-warn)',
      },
    },
  },
  plugins: [],
}

