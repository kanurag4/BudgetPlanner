import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useBudget } from '../../hooks/useBudget'
import { calculateBudget } from '../../engine/calculations'
import { formatCurrency } from '../../utils/formatCurrency'

// Only useful once income is known and while expenses are actively being entered.
const VISIBLE_ROUTES = ['/wizard/housing', '/wizard/groceries', '/wizard/fixed']

export function RunningTotalBar() {
  const location = useLocation()
  const { state } = useBudget()
  const budget = useMemo(() => calculateBudget(state, false), [state])

  if (!VISIBLE_ROUTES.includes(location.pathname)) return null
  if (budget.netIncomePerCycle <= 0) return null

  const cycleLabel = budget.salaryCycle === 'fortnightly' ? 'fortnight'
    : budget.salaryCycle === 'weekly' ? 'week'
    : 'month'

  const remaining = budget.netIncomePerCycle - budget.totalExpenses
  const isOver = remaining < 0

  return (
    <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs min-w-0 flex-wrap">
          <span className="text-slate-400 dark:text-slate-500 whitespace-nowrap">
            Income{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(budget.netIncomePerCycle)}
            </span>
            {' '}/{cycleLabel}
          </span>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
          <span className="text-slate-400 dark:text-slate-500 whitespace-nowrap">
            Spent so far{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
              {formatCurrency(budget.totalExpenses)}
            </span>
          </span>
        </div>
        <span
          className={[
            'text-xs font-bold tabular-nums whitespace-nowrap flex-shrink-0',
            isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
          ].join(' ')}
        >
          {formatCurrency(Math.abs(remaining))} {isOver ? 'over' : 'left'}
        </span>
      </div>
    </div>
  )
}
