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
    <header className="relative bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-center pt-6 pb-4 px-4 max-[800px]:flex max-[800px]:items-start max-[800px]:gap-2 max-[800px]:pt-3 max-[800px]:pb-3">

      {/* KashVector back icon — absolute on desktop, flex item on mobile */}
      <a
        href="/"
        aria-label="All KashVector tools"
        className="absolute left-4 top-3 flex flex-col items-center gap-0.5 no-underline group max-[800px]:static max-[800px]:flex-none max-[800px]:order-1 max-[800px]:mt-1.5"
      >
        <img src="/logo.svg" alt="KashVector" className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity" />
        <span className="text-[0.6rem] font-medium tracking-wide text-slate-400 group-hover:text-primary dark:text-slate-500 dark:group-hover:text-primary transition-colors whitespace-nowrap">← All tools</span>
      </a>

      {/* Centered app identity — flex-1 center column on mobile */}
      <div className="max-[800px]:flex-1 max-[800px]:min-w-0 max-[800px]:order-2 max-[800px]:text-center">
        {/* px-[52px] = logo(32) + left-padding(16) + gap(4) — clears absolute logo/toggle on desktop */}
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100 px-[52px] mb-1 max-[800px]:text-[1.1rem] max-[800px]:px-0">
          <img src={`${import.meta.env.BASE_URL}budget-icon.svg`} alt="" className="w-8 h-8" />
          Budget Planner
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-[800px]:text-xs">
          Plan your income, expenses, and savings — see exactly where your money goes each month.
        </p>
      </div>

      {/* Utility buttons — absolute on desktop, flex item on mobile */}
      <div className="absolute right-4 top-4 flex items-center gap-1 max-[800px]:static max-[800px]:flex-none max-[800px]:order-3">
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors max-[800px]:w-11 max-[800px]:h-11"
        >
          {darkMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={handleReset}
          aria-label="Reset budget planner"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors max-[800px]:w-11 max-[800px]:h-11"
        >
          <RotateCcw size={16} />
        </button>
      </div>

    </header>
  )
}
