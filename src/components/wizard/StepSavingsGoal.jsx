import { useNavigate } from 'react-router-dom'
import { useBudget } from '../../hooks/useBudget'
import { Toggle } from '../ui/Toggle'
import { AmountFrequencyInput } from '../ui/AmountFrequencyInput'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EXPENSE_FREQUENCIES } from '../../utils/constants'

export function StepSavingsGoal() {
  const navigate = useNavigate()
  const { state, actions } = useBudget()
  const { savingsGoal, income } = state

  const salaryCycle = income.primarySalary.frequency === 'weekly' ? 'weekly'
    : income.primarySalary.frequency === 'fortnightly' ? 'fortnightly'
    : 'monthly'

  const hasValidGoal = !savingsGoal.enabled || (parseFloat(savingsGoal.value) || 0) > 0

  function handleNext() {
    if (!hasValidGoal) return
    actions.setWizardStep(6)
    navigate('/wizard/profile')
  }

  function handleBack() {
    navigate('/wizard/fixed')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Do you have a savings target?
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Optional — we'll highlight how close you are each pay period.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-5">
          <Toggle
            checked={savingsGoal.enabled}
            onChange={val => actions.updateSavingsGoal({ enabled: val })}
            label="I have a savings goal"
            id="savings-goal-toggle"
          />

          {savingsGoal.enabled && (
            <div className="flex flex-col gap-4 pt-1 border-t border-slate-100 dark:border-slate-700">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'percentage', label: '% of income' },
                  { type: 'flat',       label: 'Fixed amount' },
                ].map(({ type, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => actions.updateSavingsGoal({ type })}
                    className={[
                      'py-2.5 rounded-xl border text-sm font-medium min-h-[44px] transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-sky-400',
                      savingsGoal.type === type
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-300',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Value input */}
              {savingsGoal.type === 'percentage' ? (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="savings-pct"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Target savings rate
                  </label>
                  <div className="relative max-w-[160px]">
                    <input
                      id="savings-pct"
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={savingsGoal.value}
                      onChange={e => actions.updateSavingsGoal({ value: e.target.value })}
                      placeholder="20"
                      className={[
                        'w-full pr-8 pl-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                        'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                        'text-slate-800 dark:text-slate-100 placeholder-slate-400',
                        'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent',
                      ].join(' ')}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              ) : (
                <AmountFrequencyInput
                  id="savings-flat"
                  label="Savings amount"
                  amount={savingsGoal.value}
                  frequency={savingsGoal.frequency}
                  frequencies={EXPENSE_FREQUENCIES}
                  salaryCycle={salaryCycle}
                  onChange={({ amount, frequency }) =>
                    actions.updateSavingsGoal({ value: amount, frequency })
                  }
                />
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-2 pb-safe">
        <Button fullWidth size="lg" disabled={!hasValidGoal} onClick={handleNext}>
          Next — Your Profile →
        </Button>
        <Button fullWidth size="md" variant="ghost" onClick={handleBack}>
          ← Back
        </Button>
      </div>
    </div>
  )
}
