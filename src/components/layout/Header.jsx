import { RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBudget } from '../../hooks/useBudget'

// Compact single-row header (redesign 2026-08-19, applied here 2026-08-20) --
// matches every other KashVector tool: no tagline, and no own theme toggle
// (kv-nav.js's shared nav-bar toggle is the single source of truth site-wide
// -- a second, differently-implemented toggle here duplicated it and
// visually clashed once the nav's own toggle stopped being removed).
//
// Kept a small home-logo link, unlike every other (static, multi-page) tool
// -- this app is a client-side-routed SPA (HashRouter), and <Header/> is a
// separate instance per route (WizardShell, Dashboard). kv-nav.js's own nav
// (with its own KashVector logo) is inserted exactly once, via a
// MutationObserver that disconnects after its first successful insert --
// it doesn't move or re-insert itself when React swaps out the surrounding
// route tree (e.g. Reset navigating from a wizard step back to
// /wizard/income), and was found live to go missing entirely after a full
// wizard run + reset. This link is React-owned, so it survives every route
// change reliably; the shared nav's own logo does not, here.
export function Header() {
  const { actions } = useBudget()
  const navigate = useNavigate()

  function handleReset() {
    if (window.confirm('Reset everything and start over? This cannot be undone.')) {
      actions.resetAll()
      navigate('/wizard/income')
    }
  }

  return (
    <header className="relative bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center px-14 py-3">
      <a
        href="/"
        aria-label="All KashVector tools"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors max-[800px]:w-11 max-[800px]:h-11"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </a>

      <h1 className="flex items-center gap-2 text-[1.15rem] font-bold text-slate-900 dark:text-slate-100 max-[800px]:text-[1.05rem]">
        <img src={`${import.meta.env.BASE_URL}budget-icon.svg`} alt="" className="w-7 h-7" />
        Budget Planner
      </h1>

      <button
        onClick={handleReset}
        aria-label="Reset budget planner"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors max-[800px]:w-11 max-[800px]:h-11"
      >
        <RotateCcw size={16} />
      </button>
    </header>
  )
}
