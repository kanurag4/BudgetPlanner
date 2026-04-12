import { useNavigate } from 'react-router-dom'
import { useBudget } from '../../hooks/useBudget'
import { AmountFrequencyInput } from '../ui/AmountFrequencyInput'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { HOUSING_FREQUENCIES } from '../../utils/constants'

export function StepGroceries() {
  const navigate = useNavigate()
  const { state, actions } = useBudget()
  const { groceries, income } = state

  const salaryCycle = income.primarySalary.frequency === 'fortnightly' ? 'fortnightly' : 'monthly'

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
          How much do you spend on groceries?
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Include supermarket runs and any regular food shopping.
        </p>
      </div>

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
          Not sure? Leave it at $0 and update later.
        </p>
      </Card>

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
