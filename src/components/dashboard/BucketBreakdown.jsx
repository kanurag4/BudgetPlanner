import { Card } from '../ui/Card'
import { formatCurrency } from '../../utils/formatCurrency'
import { SavingsSplitSliders } from './SavingsSplitSliders'
import { normaliseToFrequency } from '../../engine/normalise'

function LineItem({ label, amount, sub, bold = false }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-stone-100 dark:border-stone-700 last:border-0">
      <div className="min-w-0">
        <p className={`text-sm truncate ${bold ? 'font-semibold text-stone-800 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}`}>
          {label}
        </p>
        {sub && (
          <p className="text-xs text-stone-400 dark:text-stone-500">{sub}</p>
        )}
      </div>
      <p className={`text-sm tabular-nums flex-shrink-0 ${bold ? 'font-bold text-stone-900 dark:text-stone-50' : 'font-medium text-stone-700 dark:text-stone-200'}`}>
        {formatCurrency(amount)}
      </p>
    </div>
  )
}

function SectionHeader({ dot, title, total }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">{title}</h3>
      </div>
      <span className="text-sm font-bold tabular-nums text-stone-800 dark:text-stone-100">
        {formatCurrency(total)}
      </span>
    </div>
  )
}

/**
 * Props:
 *   budget     {object}  — output of calculateBudget()
 *   state      {object}  — full BudgetContext state (for item names and details)
 *   isAnnual   {boolean}
 *   cycleLabel {string}  — 'month' | 'fortnight'
 */
export function BucketBreakdown({ budget, state, isAnnual, cycleLabel }) {
  const {
    housingPerCycle, regularBucket, regularBucketAnnual,
    groceriesPerCycle,
    vehicleLoanPerCycle, otherLoansPerCycle,
    utilitiesPerCycle, councilFeesPerCycle, strataFeesPerCycle, medicalInsurancePerCycle,
    fixedBucket, fixedBucketAnnual,
    actualSavings, actualSavingsAnnual,
    periodsPerYear,
  } = budget

  const { housing, groceries, fixedExpenses } = state

  const mult = isAnnual ? periodsPerYear : 1
  const savingsAmount = Math.max(0, isAnnual ? actualSavingsAnnual : actualSavings)

  const regularTotal = isAnnual ? regularBucketAnnual : regularBucket
  const fixedTotal   = isAnnual ? fixedBucketAnnual   : fixedBucket

  return (
    <div className="flex flex-col gap-4">
      {/* Regular bucket */}
      <Card>
        <SectionHeader dot="#f59e0b" title="Regular Expenses" total={regularTotal} />
        <LineItem
          label={housing.type === 'loan' ? 'Mortgage' : 'Rent'}
          amount={housingPerCycle * mult}
        />
        <LineItem
          label="Groceries"
          amount={groceriesPerCycle * mult}
        />
        {vehicleLoanPerCycle > 0 && (
          <LineItem label="Vehicle loan" amount={vehicleLoanPerCycle * mult} />
        )}
        {otherLoansPerCycle > 0 && (
          <LineItem label="Other loans" amount={otherLoansPerCycle * mult} />
        )}
        {utilitiesPerCycle > 0 && (
          <LineItem label="Utilities" amount={utilitiesPerCycle * mult} />
        )}
        {councilFeesPerCycle > 0 && (
          <LineItem label="Council rates" amount={councilFeesPerCycle * mult} />
        )}
        {strataFeesPerCycle > 0 && (
          <LineItem label="Strata fees" amount={strataFeesPerCycle * mult} />
        )}
        {medicalInsurancePerCycle > 0 && (
          <LineItem label="Health insurance" amount={medicalInsurancePerCycle * mult} />
        )}
      </Card>

      {/* Fixed bucket */}
      <Card>
        <SectionHeader dot="#3b82f6" title="Fixed Expenses" total={fixedTotal} />
        {fixedExpenses.length === 0 ? (
          <p className="text-sm text-stone-400 dark:text-stone-500 py-2">
            No fixed expenses added.
          </p>
        ) : (
          fixedExpenses.map(expense => {
            const perCycle = normaliseToFrequency(
              parseFloat(expense.amount) || 0,
              expense.frequency,
              budget.salaryCycle
            )
            return (
              <LineItem
                key={expense.id}
                label={expense.name}
                amount={perCycle * mult}
              />
            )
          })
        )}
      </Card>

      {/* Savings bucket */}
      <Card>
        <SectionHeader dot="#10b981" title="Savings" total={savingsAmount} />
        {actualSavings <= 0 ? (
          <p className="text-sm text-rose-500 dark:text-rose-400 py-2">
            No savings available — expenses exceed income.
          </p>
        ) : (
          <SavingsSplitSliders
            savingsPerCycle={isAnnual ? actualSavingsAnnual : actualSavings}
            cycleLabel={isAnnual ? 'year' : cycleLabel}
          />
        )}
      </Card>
    </div>
  )
}
