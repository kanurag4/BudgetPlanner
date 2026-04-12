import { Card } from '../ui/Card'
import { formatCurrency } from '../../utils/formatCurrency'
import { SUPER_RATE } from '../../utils/constants'

/**
 * Props:
 *   budget     {object}  — output of calculateBudget()
 *   isAnnual   {boolean}
 *   cycleLabel {string}  — 'month' | 'fortnight'
 */
export function SuperannuationCard({ budget, isAnnual, cycleLabel }) {
  const { superPerCycle, superAnnual } = budget

  const display = isAnnual ? superAnnual : superPerCycle
  const secondary = isAnnual ? superPerCycle : superAnnual
  const secondaryLabel = isAnnual ? `per ${cycleLabel}` : 'per year'

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        {/* Left: label + secondary */}
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Employer Super
          </p>
          <p className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
            {formatCurrency(display)}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            {isAnnual ? 'per year' : `per ${cycleLabel}`}
            {' · '}
            {formatCurrency(secondary)} {secondaryLabel}
          </p>
        </div>

        {/* Right: rate badge */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 py-2 min-w-[64px]">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums leading-none">
            {(SUPER_RATE * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-blue-500 dark:text-blue-500 mt-0.5 text-center leading-tight">
            SGC rate
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-stone-400 dark:text-stone-500 border-t border-stone-100 dark:border-stone-700 pt-3">
        Employer contribution (Superannuation Guarantee) — separate from your take-home pay.
        Paid into your super fund by your employer.
      </p>
    </Card>
  )
}
