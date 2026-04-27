import { createContext, useEffect } from 'react'
import { useStorage } from '../hooks/useStorage'

export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useStorage('kv-theme', 'dark')

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
