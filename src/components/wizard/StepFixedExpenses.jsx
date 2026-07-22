import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useBudget } from '../../hooks/useBudget'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { MoneyInput } from '../ui/MoneyInput'
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

  function handleNext() {
    actions.setWizardStep(5)
    navigate('/wizard/savings')
  }

  function handleBack() {
    navigate('/wizard/groceries')
  }

  const incompleteCount = fixedExpenses.filter(
    e => !e.name.trim() || !((parseFloat(e.amount) || 0) > 0)
  ).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Any fixed expenses?
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Subscriptions, memberships, fees — anything predictable.
        </p>
      </div>

      {/* Quick-add suggestions — always shown while suggestions remain */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">
            Quick add
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map(suggestion => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => handleSuggestion(suggestion)}
                className={[
                  'px-3 py-1.5 rounded-full border text-xs font-medium transition-colors min-h-[36px]',
                  'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800',
                  'hover:border-primary hover:text-primary hover:bg-[color-mix(in_srgb,var(--kv-accent)_8%,transparent)]',
                ].join(' ')}
              >
                + {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expense rows */}
      {fixedExpenses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {fixedExpenses.map((expense) => {
            const isIncomplete = !expense.name.trim() || !((parseFloat(expense.amount) || 0) > 0)
            return (
            <Card
              key={expense.id}
              padding={false}
              className={`p-4 ${isIncomplete ? 'border-amber-300 dark:border-amber-700' : ''}`}
            >
              <div className="flex flex-col gap-3">
                {/* Name */}
                <input
                  type="text"
                  value={expense.name}
                  onChange={e => actions.updateFixedExpense(expense.id, { name: e.target.value })}
                  placeholder="Expense name"
                  className={[
                    'w-full px-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                    'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                    'text-slate-800 dark:text-slate-100 placeholder-slate-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  ].join(' ')}
                />

                {/* Amount + frequency + delete */}
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium pointer-events-none">
                      $
                    </span>
                    <MoneyInput
                      value={expense.amount}
                      onChange={raw => actions.updateFixedExpense(expense.id, { amount: raw })}
                      placeholder="0"
                      className={[
                        'w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                        'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                        'text-slate-800 dark:text-slate-100 placeholder-slate-400',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                      ].join(' ')}
                    />
                  </div>

                  <select
                    value={expense.frequency}
                    onChange={e => actions.updateFixedExpense(expense.id, { frequency: e.target.value })}
                    aria-label="Expense frequency"
                    className={[
                      'px-3 py-2.5 rounded-xl border text-sm font-medium min-h-[44px]',
                      'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                      'text-slate-800 dark:text-slate-100',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
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
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {isIncomplete && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={12} className="flex-shrink-0" />
                    {!expense.name.trim() ? 'Add a name' : 'Add an amount'} or remove this row
                  </p>
                )}
              </div>
            </Card>
            )
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center gap-2 py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 bg-transparent shadow-none">
          <p className="text-slate-400 dark:text-slate-500 text-sm">No fixed expenses yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            Use the quick-add chips above or the button below
          </p>
        </Card>
      )}

      {/* Manual add */}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors min-h-[44px]"
      >
        <Plus size={16} />
        Add custom expense
      </button>

      {/* Navigation */}
      <div className="flex flex-col gap-2 pb-safe">
        {incompleteCount > 0 && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle size={12} className="flex-shrink-0" />
            {incompleteCount === 1
              ? '1 expense is missing a name or amount'
              : `${incompleteCount} expenses are missing a name or amount`}
          </p>
        )}
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
