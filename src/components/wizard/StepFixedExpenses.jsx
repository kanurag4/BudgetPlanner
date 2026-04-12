import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useBudget } from '../../hooks/useBudget'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FREQUENCIES, EXPENSE_FREQUENCIES } from '../../utils/constants'

// Suggestions with sensible default frequencies
const SUGGESTIONS = [
  { label: 'Netflix',              frequency: 'monthly'   },
  { label: 'Amazon Prime',         frequency: 'monthly'   },
  { label: 'Spotify',              frequency: 'monthly'   },
  { label: 'Gym membership',       frequency: 'monthly'   },
  { label: 'Sports / activities',  frequency: 'monthly'   },
  { label: 'Other subscriptions',  frequency: 'monthly'   },
  { label: 'Kids school fees',     frequency: 'quarterly' },
  { label: 'School uniform',       frequency: 'yearly'    },
  { label: 'Fashion & clothing',   frequency: 'quarterly' },
  { label: 'Transportation',       frequency: 'monthly'   },
  { label: 'Insurance',            frequency: 'monthly'   },
]

export function StepFixedExpenses() {
  const navigate = useNavigate()
  const { state, actions } = useBudget()
  const { fixedExpenses } = state

  // Hide suggestions that are already added (case-insensitive match)
  const addedNames = new Set(fixedExpenses.map(e => e.name.trim().toLowerCase()))
  const availableSuggestions = SUGGESTIONS.filter(
    s => !addedNames.has(s.label.toLowerCase())
  )

  function handleAdd() {
    actions.addFixedExpense({ name: '', amount: '', frequency: 'monthly' })
  }

  function handleSuggestion({ label, frequency }) {
    actions.addFixedExpense({ name: label, amount: '', frequency })
  }

  function handleDropdownChange(e) {
    const val = e.target.value
    if (!val) return
    const suggestion = SUGGESTIONS.find(s => s.label === val)
    if (suggestion) handleSuggestion(suggestion)
    // Reset dropdown back to placeholder
    e.target.value = ''
  }

  function handleNext() {
    actions.setWizardStep(5)
    navigate('/wizard/savings')
  }

  function handleBack() {
    navigate('/wizard/groceries')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Any fixed expenses?
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Subscriptions, memberships, fees — anything predictable.
        </p>
      </div>

      {/* Quick-add dropdown — shown while suggestions remain */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide px-1">
            Quick add
          </p>
          <select
            defaultValue=""
            onChange={handleDropdownChange}
            aria-label="Quick-add a common expense"
            className={[
              'w-full px-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
              'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600',
              'text-stone-800 dark:text-stone-100',
              'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent',
            ].join(' ')}
          >
            <option value="" disabled>Select a common expense to add…</option>
            {availableSuggestions.map(s => (
              <option key={s.label} value={s.label}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Expense rows */}
      {fixedExpenses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {fixedExpenses.map((expense) => (
            <Card key={expense.id} padding={false} className="p-4">
              <div className="flex flex-col gap-3">
                {/* Name */}
                <input
                  type="text"
                  value={expense.name}
                  onChange={e => actions.updateFixedExpense(expense.id, { name: e.target.value })}
                  placeholder="Expense name"
                  className={[
                    'w-full px-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                    'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600',
                    'text-stone-800 dark:text-stone-100 placeholder-stone-400',
                    'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent',
                  ].join(' ')}
                />

                {/* Amount + frequency + delete */}
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 text-sm font-medium pointer-events-none">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={expense.amount}
                      onChange={e => actions.updateFixedExpense(expense.id, { amount: e.target.value })}
                      placeholder="0"
                      className={[
                        'w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                        'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600',
                        'text-stone-800 dark:text-stone-100 placeholder-stone-400',
                        'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent',
                      ].join(' ')}
                    />
                  </div>

                  <select
                    value={expense.frequency}
                    onChange={e => actions.updateFixedExpense(expense.id, { frequency: e.target.value })}
                    aria-label="Expense frequency"
                    className={[
                      'px-3 py-2.5 rounded-xl border text-sm font-medium min-h-[44px]',
                      'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600',
                      'text-stone-800 dark:text-stone-100',
                      'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent',
                    ].join(' ')}
                  >
                    {EXPENSE_FREQUENCIES.map(f => (
                      <option key={f} value={f}>{FREQUENCIES[f]?.label ?? f}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => actions.removeFixedExpense(expense.id)}
                    aria-label="Remove expense"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center gap-2 py-8 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 bg-transparent shadow-none">
          <p className="text-stone-400 dark:text-stone-500 text-sm">No fixed expenses yet</p>
          <p className="text-stone-400 dark:text-stone-500 text-xs">
            Use the quick-add chips above or the button below
          </p>
        </Card>
      )}

      {/* Manual add */}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 py-3 text-sm font-medium text-stone-500 dark:text-stone-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors min-h-[44px]"
      >
        <Plus size={16} />
        Add custom expense
      </button>

      {/* Navigation */}
      <div className="flex flex-col gap-2 pb-safe">
        <Button fullWidth size="lg" onClick={handleNext}>
          Next — Savings Goal →
        </Button>
        <Button fullWidth size="md" variant="ghost" onClick={handleBack}>
          ← Back
        </Button>
      </div>
    </div>
  )
}
