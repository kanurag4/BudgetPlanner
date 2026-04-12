import { Moon, Sun, RotateCcw } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useBudget } from '../../hooks/useBudget'

export function Header() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { actions } = useBudget()

  function handleReset() {
    if (window.confirm('Reset everything and start over? This cannot be undone.')) {
      actions.resetAll()
      window.location.href = '/wizard/income'
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-100 dark:border-stone-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 text-stone-900 dark:text-stone-100 hover:opacity-80 transition-opacity"
          aria-label="Budget Planner home"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-white text-sm font-bold select-none">
            B
          </span>
          <span className="font-semibold text-sm hidden sm:inline">Budget Planner</span>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            aria-label="Reset budget planner"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-400 dark:text-stone-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>

      </div>
    </header>
  )
}
