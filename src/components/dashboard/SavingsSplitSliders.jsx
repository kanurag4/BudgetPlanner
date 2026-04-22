import { useBudget } from '../../hooks/useBudget'
import { SliderInput } from '../ui/SliderInput'
import { formatCurrency } from '../../utils/formatCurrency'

const SLIDERS = [
  { key: 'splurge',    label: 'Splurge',    color: 'emerald', description: 'Lifestyle & fun spending' },
  { key: 'emergency',  label: 'Emergency',  color: 'amber',   description: 'Rainy-day buffer' },
  { key: 'investment', label: 'Investment', color: 'blue',    description: 'Long-term wealth building' },
]

/**
 * Props:
 *   savingsPerCycle {number} — actual savings amount (for showing dollar splits)
 *   cycleLabel      {string} — 'month' | 'fortnight'
 */
export function SavingsSplitSliders({ savingsPerCycle = 0, cycleLabel = 'month' }) {
  const { state, actions } = useBudget()
  const { splitSliders } = state

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Split your savings
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Must sum to 100%
        </span>
      </div>

      {SLIDERS.map(({ key, label, color, description }) => {
        const pct    = splitSliders[key] ?? 0
        const amount = savingsPerCycle * (pct / 100)

        return (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
              </div>
              {savingsPerCycle > 0 && (
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums flex-shrink-0">
                  {formatCurrency(amount)}
                  <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                    /{cycleLabel}
                  </span>
                </span>
              )}
            </div>

            <SliderInput
              value={pct}
              onChange={val => actions.updateSplitSlider(key, val)}
              color={color}
              aria-label={`${label} slider`}
            />
          </div>
        )
      })}

      {/* Sum check — should always be 100, shown as reassurance */}
      <p className="text-xs text-slate-400 dark:text-slate-500 text-right tabular-nums">
        Total: {Object.values(splitSliders).reduce((a, b) => a + b, 0)}%
      </p>
    </div>
  )
}
