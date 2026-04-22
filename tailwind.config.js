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
        primary: {
          DEFAULT: '#38bdf8', // sky-400
          dark: '#0ea5e9',    // sky-500
        },
        accent: '#fbbf24',    // amber-400
      },
    },
  },
  plugins: [],
}

