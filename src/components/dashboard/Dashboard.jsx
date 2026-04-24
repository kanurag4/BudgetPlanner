import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useBudget } from '../../hooks/useBudget'
import { calculateBudget } from '../../engine/calculations'
import { Header } from '../layout/Header'
import { ViewToggle } from './ViewToggle'
import { SummaryCards } from './SummaryCards'
import { BucketWaterfallChart } from './BucketWaterfallChart'
import { BucketBreakdown } from './BucketBreakdown'
import { SuperannuationCard } from './SuperannuationCard'
import { SavingsRateAlert } from './SavingsRateAlert'
import { ExpenseCalendar } from './ExpenseCalendar'
import { ScenarioPanel } from './ScenarioPanel'
import { ExportButton } from './ExportButton'
import { Card } from '../ui/Card'

export function Dashboard() {
  const navigate = useNavigate()
  const { state } = useBudget()
  const { dashboardView, profile, fixedExpenses } = state

  const budget = useMemo(() => calculateBudget(state, false), [state])
  const scenarioBudget = useMemo(
    () => state.scenario?.active ? calculateBudget(state, true) : null,
    [state]
  )

  const isAnnual = dashboardView === 'annual'
  const cycleLabel = budget.salaryCycle === 'fortnightly' ? 'fortnight'
    : budget.salaryCycle === 'weekly' ? 'week'
    : 'month'

  // Charts and breakdowns use scenario figures when active; alerts use base
  const displayBudget = scenarioBudget ?? budget

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-safe-lg flex flex-col gap-5">

        {/* Title + actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
              Your Budget
            </h1>
            <button
              onClick={() => navigate('/wizard/income')}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium min-h-[32px]',
                'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                'hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/20 dark:hover:text-sky-400',
                'transition-colors duration-150 flex-shrink-0',
              ].join(' ')}
              aria-label="Edit budget answers"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
          <ViewToggle />
        </div>

        {/* Scenario active banner */}
        {state.scenario?.active && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-2">
            <span className="text-amber-500 text-sm font-bold" aria-hidden>~</span>
            <p className="text-sm text-amber-700 dark:text-amber-400 flex-1">
              Scenario mode — figures below reflect your overrides
            </p>
          </div>
        )}

        {/* Summary cards */}
        <SummaryCards
          budget={displayBudget}
          isAnnual={isAnnual}
          cycleLabel={cycleLabel}
        />

        {/* Savings rate alert — always uses base budget */}
        <SavingsRateAlert budget={budget} profile={profile} />

        {/* Waterfall chart */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Budget breakdown
          </h2>
          <BucketWaterfallChart
            budget={displayBudget}
            isAnnual={isAnnual}
          />
        </Card>

        {/* Bucket breakdown + split sliders */}
        <BucketBreakdown
          budget={displayBudget}
          state={state}
          isAnnual={isAnnual}
          cycleLabel={cycleLabel}
        />

        {/* Superannuation */}
        <SuperannuationCard
          budget={displayBudget}
          isAnnual={isAnnual}
          cycleLabel={cycleLabel}
        />

        {/* Expense schedule — only when fixed expenses exist */}
        {fixedExpenses.length > 0 && (
          <ExpenseCalendar
            fixedExpenses={fixedExpenses}
            salaryCycle={budget.salaryCycle}
          />
        )}

        {/* Scenario what-if panel */}
        <ScenarioPanel budget={budget} scenarioBudget={scenarioBudget} />

        {/* Export */}
        <ExportButton
          budget={displayBudget}
          state={state}
          isAnnual={isAnnual}
          cycleLabel={cycleLabel}
        />

      </main>
    </div>
  )
}
