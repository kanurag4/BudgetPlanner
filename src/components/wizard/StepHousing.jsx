import { useNavigate } from 'react-router-dom'
import { Home, Building2, Car, CreditCard, TrendingUp, Plus, Trash2 } from 'lucide-react'
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

  const salaryCycle = income.primarySalary.frequency === 'weekly' ? 'weekly'
    : income.primarySalary.frequency === 'fortnightly' ? 'fortnightly'
    : 'monthly'
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

  function patchInvestmentLoan(patch) {
    actions.updateHousing({ investmentLoan: { ...housing.investmentLoan, ...patch } })
  }

  const additionalLoans = housing.additionalLoans || []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Housing &amp; loans
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
              'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
              housing.type === type
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-300',
            ].join(' ')}
          >
            <Icon size={24} className={housing.type === type ? 'text-sky-500' : 'text-slate-400'} />
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
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">
          Additional loan repayments
        </p>

        {/* Vehicle loan */}
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Car size={18} className="text-slate-400 flex-shrink-0" />
              <Toggle
                id="vehicle-loan-toggle"
                checked={housing.vehicleLoan?.enabled ?? false}
                onChange={checked => patchVehicleLoan({ enabled: checked })}
                label="Vehicle loan"
                description="Car, motorbike, or other vehicle repayment"
              />
            </div>
            {housing.vehicleLoan?.enabled && (
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
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
              <CreditCard size={18} className="text-slate-400 flex-shrink-0" />
              <Toggle
                id="other-loans-toggle"
                checked={housing.otherLoans?.enabled ?? false}
                onChange={checked => patchOtherLoans({ enabled: checked })}
                label="Other loans"
                description="Personal loans, HECS/HELP, or any other repayments"
              />
            </div>
            {housing.otherLoans?.enabled && (
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
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
        {/* Investment loan */}
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-slate-400 flex-shrink-0" />
              <Toggle
                id="investment-loan-toggle"
                checked={housing.investmentLoan?.enabled ?? false}
                onChange={checked => patchInvestmentLoan({ enabled: checked })}
                label="Investment loan"
                description="Property or asset loan — track repayments and rental/investment income"
              />
            </div>
            {housing.investmentLoan?.enabled && (
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex flex-col gap-4">
                <AmountFrequencyInput
                  id="investment-loan-repayment"
                  label="Loan repayment"
                  amount={housing.investmentLoan.amount}
                  frequency={housing.investmentLoan.frequency}
                  frequencies={EXPENSE_FREQUENCIES}
                  salaryCycle={salaryCycle}
                  onChange={({ amount, frequency }) => patchInvestmentLoan({ amount, frequency })}
                />
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                  <AmountFrequencyInput
                    id="investment-loan-income"
                    label="Income from investment (e.g. rent)"
                    amount={housing.investmentLoan.income}
                    frequency={housing.investmentLoan.incomeFrequency}
                    frequencies={EXPENSE_FREQUENCIES}
                    salaryCycle={salaryCycle}
                    onChange={({ amount, frequency }) => patchInvestmentLoan({ income: amount, incomeFrequency: frequency })}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Manual additional loans */}
        {additionalLoans.length > 0 && (
          <div className="flex flex-col gap-3">
            {additionalLoans.map(loan => (
              <Card key={loan.id} padding={false} className="p-4">
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={loan.name}
                    onChange={e => actions.updateHousingLoan(loan.id, { name: e.target.value })}
                    placeholder="Loan name (e.g. Personal loan)"
                    className={[
                      'w-full px-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                      'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                      'text-slate-800 dark:text-slate-100 placeholder-slate-400',
                      'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent',
                    ].join(' ')}
                  />
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium pointer-events-none">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={loan.amount}
                        onChange={e => actions.updateHousingLoan(loan.id, { amount: e.target.value })}
                        placeholder="0"
                        className={[
                          'w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                          'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                          'text-slate-800 dark:text-slate-100 placeholder-slate-400',
                          'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent',
                        ].join(' ')}
                      />
                    </div>
                    <select
                      value={loan.frequency}
                      onChange={e => actions.updateHousingLoan(loan.id, { frequency: e.target.value })}
                      aria-label="Loan repayment frequency"
                      className={[
                        'px-3 py-2.5 rounded-xl border text-sm font-medium min-h-[44px]',
                        'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                        'text-slate-800 dark:text-slate-100',
                        'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent',
                      ].join(' ')}
                    >
                      {EXPENSE_FREQUENCIES.map(f => (
                        <option key={f} value={f}>
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => actions.removeHousingLoan(loan.id)}
                      aria-label="Remove loan"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add loan button */}
        <button
          type="button"
          onClick={() => actions.addHousingLoan({ name: '', amount: '', frequency: 'monthly' })}
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors min-h-[44px]"
        >
          <Plus size={16} />
          Add another loan
        </button>
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
