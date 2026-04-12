import { useNavigate } from 'react-router-dom'
import { useBudget } from '../../hooks/useBudget'
import { AmountFrequencyInput } from '../ui/AmountFrequencyInput'
import { Toggle } from '../ui/Toggle'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { HOUSING_FREQUENCIES, EXPENSE_FREQUENCIES } from '../../utils/constants'

const HOUSEHOLD_ITEMS = [
  {
    key: 'utilities',
    label: 'Utilities',
    description: 'Electricity, gas, water combined',
    frequencies: ['quarterly', 'monthly', 'fortnightly', 'weekly'],
  },
  {
    key: 'councilFees',
    label: 'Council rates',
    description: 'Local council rates / fees',
    frequencies: EXPENSE_FREQUENCIES,
  },
  {
    key: 'strataFees',
    label: 'Strata fees',
    description: 'Body corporate / owners corporation levy',
    frequencies: EXPENSE_FREQUENCIES,
  },
  {
    key: 'medicalInsurance',
    label: 'Health insurance',
    description: 'Private health / medical insurance premium',
    frequencies: HOUSING_FREQUENCIES,
  },
]

export function StepGroceries() {
  const navigate = useNavigate()
  const { state, actions } = useBudget()
  const { groceries, householdBills, income } = state

  const salaryCycle = income.primarySalary.frequency === 'weekly' ? 'weekly'
    : income.primarySalary.frequency === 'fortnightly' ? 'fortnightly'
    : 'monthly'

  function handleNext() {
    actions.setWizardStep(4)
    navigate('/wizard/fixed')
  }

  function handleBack() {
    navigate('/wizard/housing')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Groceries &amp; household bills
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Food shopping plus regular household expenses.
        </p>
      </div>

      {/* Groceries */}
      <Card>
        <AmountFrequencyInput
          id="groceries"
          label="Grocery spend"
          amount={groceries.amount}
          frequency={groceries.frequency}
          frequencies={HOUSING_FREQUENCIES}
          salaryCycle={salaryCycle}
          onChange={({ amount, frequency }) => actions.updateGroceries({ amount, frequency })}
          placeholder="0"
        />
        <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
          Include supermarket runs and any regular food shopping.
        </p>
      </Card>

      {/* Household bills */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide px-1">
          Household bills
        </p>

        {HOUSEHOLD_ITEMS.map(({ key, label, description, frequencies }) => {
          const bill = householdBills?.[key] ?? { enabled: false, amount: '', frequency: frequencies[0] }

          return (
            <Card key={key}>
              <div className="flex flex-col gap-4">
                <Toggle
                  id={`bill-${key}`}
                  checked={bill.enabled}
                  onChange={checked => actions.updateHouseholdBill(key, { enabled: checked })}
                  label={label}
                  description={description}
                />
                {bill.enabled && (
                  <div className="border-t border-stone-100 dark:border-stone-700 pt-4">
                    <AmountFrequencyInput
                      id={`bill-${key}-amount`}
                      label="Amount"
                      amount={bill.amount}
                      frequency={bill.frequency}
                      frequencies={frequencies}
                      salaryCycle={salaryCycle}
                      onChange={({ amount, frequency }) =>
                        actions.updateHouseholdBill(key, { amount, frequency })
                      }
                    />
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-col gap-2 pb-safe">
        <Button fullWidth size="lg" onClick={handleNext}>
          Next — Fixed Expenses →
        </Button>
        <Button fullWidth size="md" variant="ghost" onClick={handleBack}>
          ← Back
        </Button>
      </div>
    </div>
  )
}
