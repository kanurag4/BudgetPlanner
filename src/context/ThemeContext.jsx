import { createContext, useEffect } from 'react'
import { useStorage } from '../hooks/useStorage'

export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Light-first default (redesign 2026-08-19) — matches the site-wide
  // kv-theme.js flip; only applies when a visitor has no stored preference.
  const [darkMode, setDarkMode] = useStorage('kv-theme', 'light')

  // Keep the `dark` class on <html> in sync with state
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode === 'dark')
  }, [darkMode])

  function toggleDarkMode() {
    setDarkMode(darkMode === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
