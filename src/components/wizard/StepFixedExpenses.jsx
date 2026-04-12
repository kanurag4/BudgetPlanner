import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useBudget } from '../../hooks/useBudget'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FREQUENCIES, EXPENSE_FREQUENCIES } from '../../utils/constants'

const SUGGESTIONS = ['Netflix', 'Gym membership', 'Car insurance', 'Phone plan', 'Internet', 'Electricity']

export function StepFixedExpenses() {
  const navigate = useNavigate()
  const { state, actions } = useBudget()
  const { fixedExpenses } = state

  function handleAdd() {
    actions.addFixedExpense({ name: '', amount: '', frequency: 'monthly' })
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
          Subscriptions, insurance, utilities, memberships — anything predictable.
        </p>
      </div>

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
                  placeholder="Expense name (e.g. Netflix)"
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium pointer-events-none">$</span>
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
        /* Empty state */
        <Card className="flex flex-col items-center justify-center gap-2 py-10 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 bg-transparent shadow-none">
          <p className="text-stone-400 dark:text-stone-500 text-sm">
            No fixed expenses yet
          </p>
          <p className="text-stone-400 dark:text-stone-500 text-xs max-w-xs">
            Add subscriptions, insurance, memberships or utilities
          </p>
        </Card>
      )}

      {/* Suggestions */}
      {fixedExpenses.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(name => (
            <button
              key={name}
              type="button"
              onClick={() => actions.addFixedExpense({ name, amount: '', frequency: 'monthly' })}
              className="px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors min-h-[36px]"
            >
              + {name}
            </button>
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 py-3 text-sm font-medium text-stone-500 dark:text-stone-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors min-h-[44px]"
      >
        <Plus size={16} />
        Add expense
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
