import { PERIODS_PER_YEAR } from '../utils/constants'
import { normaliseToFrequency, resolveSalaryCycle } from './normalise'
import { estimateNetPay } from './taxEstimator'

/**
 * Resolve the net amount for a salary entry.
 * If isGross, uses the tax estimator to convert to net.
 * Returns { net, gross } both as yearly amounts.
 */
function resolveNetAndGross(salary) {
  const { amount, frequency, isGross } = salary
  const value = parseFloat(amount) || 0
  if (value <= 0) return { net: 0, gross: 0 }

  const yearlyGross = normaliseToFrequency(value, frequency, 'yearly')

  if (isGross) {
    const { netAmount } = estimateNetPay(value, frequency)
    const yearlyNet = normaliseToFrequency(netAmount, frequency, 'yearly')
    return { net: yearlyNet, gross: yearlyGross }
  }

  // net entered directly — back-calculate an approximate gross for super purposes
  // We approximate gross as net / (1 - effective_rate) iteratively,
  // but for simplicity treat entered net as gross for super (small overestimate).
  return { net: yearlyGross, gross: yearlyGross }
}

/**
 * calculateBudget — pure function, powers the entire dashboard.
 *
 * @param {object} state - Full BudgetContext state
 * @param {boolean} useScenario - Whether to apply scenario overrides
 * @returns {object} All computed values, per-cycle and annual
 */
export function calculateBudget(state, useScenario = false) {
  const { income, housing, groceries, householdBills, fixedExpenses, savingsGoal, splitSliders, scenario } = state

  // --- Apply scenario overrides if active ---
  const effectiveIncome = { ...income }
  const effectiveHousing = { ...housing }

  if (useScenario && scenario?.active && scenario?.overrides) {
    const { primarySalary, partnerSalary, housingAmount } = scenario.overrides
    if (primarySalary !== null && primarySalary !== undefined) {
      effectiveIncome.primarySalary = {
        ...income.primarySalary,
        amount: primarySalary,
        isGross: false,
      }
    }
    if (partnerSalary !== null && partnerSalary !== undefined && income.partnerSalary.enabled) {
      effectiveIncome.partnerSalary = {
        ...income.partnerSalary,
        amount: partnerSalary,
        isGross: false,
      }
    }
    if (housingAmount !== null && housingAmount !== undefined) {
      effectiveHousing.amount = housingAmount
    }
  }

  // --- Salary cycle ---
  const salaryCycle = resolveSalaryCycle(effectiveIncome.primarySalary.frequency)
  const periodsPerYear = PERIODS_PER_YEAR[salaryCycle]

  // --- Primary income ---
  const primary = resolveNetAndGross(effectiveIncome.primarySalary)
  const primaryNetPerCycle = primary.net / periodsPerYear

  // --- Partner income ---
  let partnerNetPerCycle = 0
  let partnerGrossYearly = 0
  if (effectiveIncome.partnerSalary.enabled) {
    const partner = resolveNetAndGross(effectiveIncome.partnerSalary)
    partnerNetPerCycle = partner.net / periodsPerYear
    partnerGrossYearly = partner.gross
  }

  // --- Bonus (yearly, spread across pay periods) ---
  const bonusAmount = parseFloat(income.bonus?.amount) || 0
  const bonusPerCycle = bonusAmount / periodsPerYear

  // --- Total net income per cycle ---
  const netIncomePerCycle = primaryNetPerCycle + partnerNetPerCycle + bonusPerCycle

  // --- Superannuation (employer, 11.5% of gross) ---
  const superYearly = (primary.gross + partnerGrossYearly) * 0.115
  const superPerCycle = superYearly / periodsPerYear

  // --- Regular bucket ---
  const housingPerCycle = normaliseToFrequency(
    parseFloat(effectiveHousing.amount) || 0,
    effectiveHousing.frequency,
    salaryCycle
  )
  const groceriesPerCycle = normaliseToFrequency(
    parseFloat(groceries.amount) || 0,
    groceries.frequency,
    salaryCycle
  )
  const vehicleLoanPerCycle = effectiveHousing.vehicleLoan?.enabled
    ? normaliseToFrequency(parseFloat(effectiveHousing.vehicleLoan.amount) || 0, effectiveHousing.vehicleLoan.frequency, salaryCycle)
    : 0
  const otherLoansPerCycle = effectiveHousing.otherLoans?.enabled
    ? normaliseToFrequency(parseFloat(effectiveHousing.otherLoans.amount) || 0, effectiveHousing.otherLoans.frequency, salaryCycle)
    : 0

  // --- Household bills (utilities, council, strata, medical insurance) ---
  function billPerCycle(key) {
    const bill = householdBills?.[key]
    return bill?.enabled ? normaliseToFrequency(parseFloat(bill.amount) || 0, bill.frequency, salaryCycle) : 0
  }
  const utilitiesPerCycle        = billPerCycle('utilities')
  const councilFeesPerCycle      = billPerCycle('councilFees')
  const strataFeesPerCycle       = billPerCycle('strataFees')
  const medicalInsurancePerCycle = billPerCycle('medicalInsurance')
  const householdBillsPerCycle   = utilitiesPerCycle + councilFeesPerCycle + strataFeesPerCycle + medicalInsurancePerCycle

  const regularBucket = housingPerCycle + groceriesPerCycle + vehicleLoanPerCycle + otherLoansPerCycle + householdBillsPerCycle

  // --- Fixed bucket ---
  const fixedBucket = (fixedExpenses || []).reduce((sum, expense) => {
    const amt = parseFloat(expense.amount) || 0
    return sum + normaliseToFrequency(amt, expense.frequency, salaryCycle)
  }, 0)

  // --- Savings ---
  const totalExpenses = regularBucket + fixedBucket
  const actualSavings = netIncomePerCycle - totalExpenses
  const savingsRate = netIncomePerCycle > 0 ? (actualSavings / netIncomePerCycle) * 100 : 0

  // --- Savings goal ---
  let savingsGoalAmount = 0
  if (savingsGoal?.enabled) {
    if (savingsGoal.type === 'percentage') {
      savingsGoalAmount = netIncomePerCycle * ((parseFloat(savingsGoal.value) || 0) / 100)
    } else {
      savingsGoalAmount = normaliseToFrequency(
        parseFloat(savingsGoal.value) || 0,
        savingsGoal.frequency,
        salaryCycle
      )
    }
  }

  // --- Split amounts ---
  const splurge = splitSliders?.splurge ?? 20
  const emergency = splitSliders?.emergency ?? 40
  const investment = splitSliders?.investment ?? 40
  const savingsBase = Math.max(0, actualSavings)
  const splitAmounts = {
    splurge: savingsBase * (splurge / 100),
    emergency: savingsBase * (emergency / 100),
    investment: savingsBase * (investment / 100),
  }

  // --- Annual multiplier ---
  const annual = (perCycle) => perCycle * periodsPerYear

  return {
    salaryCycle,
    periodsPerYear,

    // Per-cycle values
    netIncomePerCycle,
    primaryNetPerCycle,
    partnerNetPerCycle,
    bonusPerCycle,
    superPerCycle,
    regularBucket,
    housingPerCycle,
    groceriesPerCycle,
    vehicleLoanPerCycle,
    otherLoansPerCycle,
    utilitiesPerCycle,
    councilFeesPerCycle,
    strataFeesPerCycle,
    medicalInsurancePerCycle,
    fixedBucket,
    totalExpenses,
    actualSavings,
    savingsRate,
    savingsGoalAmount,
    splitAmounts,

    // Annual equivalents
    netIncomeAnnual: annual(netIncomePerCycle),
    superAnnual: annual(superPerCycle),
    regularBucketAnnual: annual(regularBucket),
    fixedBucketAnnual: annual(fixedBucket),
    totalExpensesAnnual: annual(totalExpenses),
    actualSavingsAnnual: annual(actualSavings),
    savingsGoalAmountAnnual: annual(savingsGoalAmount),
    splitAmountsAnnual: {
      splurge: annual(splitAmounts.splurge),
      emergency: annual(splitAmounts.emergency),
      investment: annual(splitAmounts.investment),
    },
  }
}
