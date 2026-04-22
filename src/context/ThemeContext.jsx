import { createContext, useEffect } from 'react'
import { useStorage } from '../hooks/useStorage'

export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useStorage('budgetplanner_theme', true)

  // Keep the `dark` class on <html> in sync with state
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  function toggleDarkMode() {
    setDarkMode(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
