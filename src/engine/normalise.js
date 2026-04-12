import { PERIODS_PER_YEAR } from '../utils/constants'

/**
 * Convert an amount from one frequency to another.
 * e.g. normaliseToFrequency(1200, 'monthly', 'fortnightly') → ~923.08
 */
export function normaliseToFrequency(amount, fromFreq, toFreq) {
  if (fromFreq === toFreq) return amount
  const annualAmount = amount * PERIODS_PER_YEAR[fromFreq]
  return annualAmount / PERIODS_PER_YEAR[toFreq]
}

/**
 * Determine the salary cycle to use for all budget calculations.
 * Only returns 'fortnightly' if salary is paid fortnightly; everything else → 'monthly'.
 */
export function resolveSalaryCycle(salaryFreq) {
  return salaryFreq === 'fortnightly' ? 'fortnightly' : 'monthly'
}
