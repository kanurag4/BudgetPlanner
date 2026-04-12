import { useNavigate } from 'react-router-dom'
import { Home, Building2, Car, CreditCard } from 'lucide-react'
import { useBudget } from '../../hooks/useBudget'
import { AmountFrequencyInput } from '../ui/AmountFrequencyInput'
import { Toggle } from '../ui/Toggle'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { HOUSING_FREQUENCIES, EXPENSE_FREQUENCIES } from '../../utils/constants'

export function StepHousing() {
  const navigate = useNavigate()
  const { state, actions } = useBudget()
  const { housing, income } = state

  const salaryCycle = income.primarySalary.frequency === 'fortnightly' ? 'fortnightly' : 'monthly'
  const canContinue = (parseFloat(housing.amount) || 0) > 0

  function handleNext() {
    if (!canContinue) return
    actions.setWizardStep(3)
    navigate('/wizard/groceries')
  }

  function handleBack() {
    navigate('/wizard/income')
  }

  // Patch a nested loan object without losing its other fields
  function patchVehicleLoan(patch) {
    actions.updateHousing({ vehicleLoan: { ...housing.vehicleLoan, ...patch } })
  }

  function patchOtherLoans(patch) {
    actions.updateHousing({ otherLoans: { ...housing.otherLoans, ...patch } })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Housing &amp; loans
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Your housing cost plus any regular loan repayments.
        </p>
      </div>

      {/* Housing type */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { type: 'rent', label: 'Renting',   Icon: Building2 },
          { type: 'loan', label: 'Home loan', Icon: Home },
        ].map(({ type, label, Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => actions.updateHousing({ type })}
            className={[
              'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-5 min-h-[100px]',
              'font-semibold text-sm transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-stone-900',
              housing.type === type
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:border-emerald-300',
            ].join(' ')}
          >
            <Icon size={24} className={housing.type === type ? 'text-emerald-500' : 'text-stone-400'} />
            {label}
          </button>
        ))}
      </div>

      {/* Housing amount */}
      <Card>
        <AmountFrequencyInput
          id="housing"
          label={housing.type === 'loan' ? 'Repayment amount' : 'Rent amount'}
          amount={housing.amount}
          frequency={housing.frequency}
          frequencies={HOUSING_FREQUENCIES}
          salaryCycle={salaryCycle}
          onChange={({ amount, frequency }) => actions.updateHousing({ amount, frequency })}
        />
      </Card>

      {/* Additional loans */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide px-1">
          Additional loan repayments
        </p>

        {/* Vehicle loan */}
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Car size={18} className="text-stone-400 flex-shrink-0" />
              <Toggle
                id="vehicle-loan-toggle"
                checked={housing.vehicleLoan?.enabled ?? false}
                onChange={checked => patchVehicleLoan({ enabled: checked })}
                label="Vehicle loan"
                description="Car, motorbike, or other vehicle repayment"
              />
            </div>
            {housing.vehicleLoan?.enabled && (
              <div className="border-t border-stone-100 dark:border-stone-700 pt-4">
                <AmountFrequencyInput
                  id="vehicle-loan"
                  label="Repayment amount"
                  amount={housing.vehicleLoan.amount}
                  frequency={housing.vehicleLoan.frequency}
                  frequencies={EXPENSE_FREQUENCIES}
                  salaryCycle={salaryCycle}
                  onChange={({ amount, frequency }) => patchVehicleLoan({ amount, frequency })}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Other loans */}
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-stone-400 flex-shrink-0" />
              <Toggle
                id="other-loans-toggle"
                checked={housing.otherLoans?.enabled ?? false}
                onChange={checked => patchOtherLoans({ enabled: checked })}
                label="Other loans"
                description="Personal loans, HECS/HELP, or any other repayments"
              />
            </div>
            {housing.otherLoans?.enabled && (
              <div className="border-t border-stone-100 dark:border-stone-700 pt-4">
                <AmountFrequencyInput
                  id="other-loans"
                  label="Repayment amount"
                  amount={housing.otherLoans.amount}
                  frequency={housing.otherLoans.frequency}
                  frequencies={EXPENSE_FREQUENCIES}
                  salaryCycle={salaryCycle}
                  onChange={({ amount, frequency }) => patchOtherLoans({ amount, frequency })}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-2 pb-safe">
        <Button fullWidth size="lg" disabled={!canContinue} onClick={handleNext}>
          Next — Groceries →
        </Button>
        <Button fullWidth size="md" variant="ghost" onClick={handleBack}>
          ← Back
        </Button>
      </div>
    </div>
  )
}
