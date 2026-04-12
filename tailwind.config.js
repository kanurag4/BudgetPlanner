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
          DEFAULT: '#10b981', // emerald-500
          dark: '#059669',    // emerald-600
        },
        accent: '#fbbf24',    // amber-400
      },
    },
  },
  plugins: [],
}

