import { Card } from '../ui/Card'
import { formatCurrency } from '../../utils/formatCurrency'
import { normaliseToFrequency } from '../../engine/normalise'

const FREQ_META = {
  fortnightly: { label: 'Every fortnight', order: 0, short: '2wk' },
  monthly:     { label: 'Every month',      order: 1, short: 'mo'  },
  quarterly:   { label: 'Every quarter',    order: 2, short: 'qtr' },
  yearly:      { label: 'Every year',       order: 3, short: 'yr'  },
}

const FREQ_COLORS = {
  fortnightly: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  monthly:     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  quarterly:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  yearly:      'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
}

/**
 * Props:
 *   fixedExpenses {array}  — state.fixedExpenses
 *   salaryCycle   {string} — 'monthly' | 'fortnightly'
 */
export function ExpenseCalendar({ fixedExpenses, salaryCycle }) {
  if (!fixedExpenses || fixedExpenses.length === 0) return null

  // Group by frequency, sorted by FREQ_META.order
  const grouped = {}
  for (const expense of fixedExpenses) {
    const freq = expense.frequency ?? 'monthly'
    if (!grouped[freq]) grouped[freq] = []
    grouped[freq].push(expense)
  }

  const sortedFreqs = Object.keys(grouped).sort(
    (a, b) => (FREQ_META[a]?.order ?? 99) - (FREQ_META[b]?.order ?? 99)
  )

  // Total across all fixed expenses normalised to salary cycle
  const totalPerCycle = fixedExpenses.reduce((sum, e) => {
    return sum + normaliseToFrequency(parseFloat(e.amount) || 0, e.frequency, salaryCycle)
  }, 0)

  const cycleLabel = salaryCycle === 'fortnightly' ? 'fortnight' : 'month'

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
          Expense schedule
        </h2>
        <span className="text-xs text-stone-400 dark:text-stone-500 tabular-nums">
          {formatCurrency(totalPerCycle)} / {cycleLabel}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {sortedFreqs.map(freq => {
          const meta  = FREQ_META[freq] ?? { label: freq, short: freq }
          const color = FREQ_COLORS[freq] ?? FREQ_COLORS.monthly
          const items = grouped[freq]
          const groupTotal = items.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)

          return (
            <div key={freq}>
              {/* Frequency header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
                    {meta.short.toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    {meta.label}
                  </span>
                </div>
                <span className="text-xs tabular-nums text-stone-400 dark:text-stone-500">
                  {formatCurrency(groupTotal)} total
                </span>
              </div>

              {/* Expense items */}
              <div className="flex flex-col divide-y divide-stone-100 dark:divide-stone-700 rounded-xl border border-stone-100 dark:border-stone-700 overflow-hidden">
                {items.map(expense => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-stone-800"
                  >
                    <span className="text-sm text-stone-700 dark:text-stone-200 truncate pr-3">
                      {expense.name}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100 flex-shrink-0">
                      {formatCurrency(parseFloat(expense.amount) || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
