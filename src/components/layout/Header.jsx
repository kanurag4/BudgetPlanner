import { Moon, Sun, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useBudget } from '../../hooks/useBudget'

export function Header() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { actions } = useBudget()
  const navigate = useNavigate()

  function handleReset() {
    if (window.confirm('Reset everything and start over? This cannot be undone.')) {
      actions.resetAll()
      navigate('/wizard/income')
    }
  }

  return (
    <header className="relative bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-center pt-6 pb-4 px-4">

      {/* KashVector back icon */}
      <a
        href="/"
        aria-label="KashVector home"
        className="absolute left-4 top-4 opacity-90 hover:opacity-100 transition-opacity"
      >
        <img src="/logo.svg" alt="KashVector" className="w-8 h-8" />
      </a>

      {/* Utility buttons */}
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={handleReset}
          aria-label="Reset budget planner"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Centered app identity */}
      <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100 px-12 mb-1">
        <img src={`${import.meta.env.BASE_URL}Budget.png`} alt="" className="w-8 h-8 rounded-md" />
        Budget Planner
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Plan your income, expenses, and savings — see exactly where your money goes each month.
      </p>

    </header>
  )
}
