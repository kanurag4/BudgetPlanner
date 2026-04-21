import { Card } from '../ui/Card'
import { formatCurrency } from '../../utils/formatCurrency'

function SummaryCard({ label, amount, cycleLabel, isAnnual, colorClass, subLabel }) {
  return (
    <Card className="flex flex-col gap-1 min-w-0">
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-xl font-bold tabular-nums leading-tight ${colorClass}`}>
        {formatCurrency(amount)}
      </p>
      <p className="text-xs text-stone-400 dark:text-stone-500">
        {subLabel ?? (isAnnual ? 'per year' : `per ${cycleLabel}`)}
      </p>
    </Card>
  )
}

/**
 * Props:
 *   budget     {object}  — output of calculateBudget()
 *   isAnnual   {boolean} — whether to show annual or per-cycle figures
 *   cycleLabel {string}  — 'month' | 'fortnight'
 */
export function SummaryCards({ budget, isAnnual, cycleLabel }) {
  const {
    netIncomePerCycle, netIncomeAnnual,
    totalExpenses, totalExpensesAnnual,
    actualSavings, actualSavingsAnnual,
    superPerCycle, superAnnual,
    bonusAnnual,
    investmentLoanIncomePerCycle, periodsPerYear,
  } = budget

  const isOverBudget = actualSavings < 0
  const hasBonus = bonusAnnual > 0
  const hasInvestmentIncome = (investmentLoanIncomePerCycle ?? 0) > 0
  const investmentIncomeAnnual = (investmentLoanIncomePerCycle ?? 0) * periodsPerYear

  const cards = [
    {
      label: 'Net Income',
      amount: isAnnual ? netIncomeAnnual : netIncomePerCycle,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
    },
    ...(hasBonus ? [{
      label: 'Annual Bonus',
      amount: bonusAnnual,
      colorClass: 'text-amber-600 dark:text-amber-400',
      subLabel: 'per year (one-off)',
    }] : []),
    ...(hasInvestmentIncome ? [{
      label: 'Investment Income',
      amount: isAnnual ? investmentIncomeAnnual : investmentLoanIncomePerCycle,
      colorClass: 'text-teal-600 dark:text-teal-400',
    }] : []),
    {
      label: 'Total Expenses',
      amount: isAnnual ? totalExpensesAnnual : totalExpenses,
      colorClass: 'text-stone-800 dark:text-stone-100',
    },
    {
      label: 'Savings',
      amount: isAnnual ? actualSavingsAnnual : actualSavings,
      colorClass: isOverBudget
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Employer Super',
      amount: isAnnual ? superAnnual : superPerCycle,
      colorClass: 'text-blue-600 dark:text-blue-400',
      subLabel: isAnnual ? 'per year (est.)' : `per ${cycleLabel} (est.)`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(card => (
        <SummaryCard
          key={card.label}
          {...card}
          isAnnual={isAnnual}
          cycleLabel={cycleLabel}
        />
      ))}
    </div>
  )
}
