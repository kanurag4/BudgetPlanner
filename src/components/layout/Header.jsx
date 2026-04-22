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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 text-slate-900 dark:text-slate-100 hover:opacity-80 transition-opacity"
          aria-label="Budget Planner home"
        >
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="KashVector" className="w-7 h-7" />
          <img src={`${import.meta.env.BASE_URL}Budget.png`} alt="" className="w-7 h-7 rounded-md" />
          <span className="font-semibold text-sm hidden sm:inline">Budget Planner</span>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            aria-label="Reset budget planner"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>

      </div>
    </header>
  )
}
