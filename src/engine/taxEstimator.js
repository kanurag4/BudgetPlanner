import { AU_TAX_BRACKETS, LITO, MEDICARE_LEVY_RATE, PERIODS_PER_YEAR } from '../utils/constants'
import { normaliseToFrequency } from './normalise'

/**
 * Calculate LITO (Low Income Tax Offset) for a given yearly gross income.
 */
function calculateLITO(yearlyGross) {
  if (yearlyGross <= LITO.phase1Start) return LITO.maxOffset

  if (yearlyGross <= LITO.phase1End) {
    return LITO.maxOffset - (yearlyGross - LITO.phase1Start) * LITO.phase1Rate
  }

  if (yearlyGross <= LITO.phase2End) {
    const afterPhase1 = LITO.maxOffset - (LITO.phase1End - LITO.phase1Start) * LITO.phase1Rate
    return Math.max(0, afterPhase1 - (yearlyGross - LITO.phase2Start) * LITO.phase2Rate)
  }

  return 0
}

/**
 * Calculate income tax on a yearly gross amount using AU 2024–25 tax brackets.
 */
function calculateIncomeTax(yearlyGross) {
  if (yearlyGross <= 0) return 0

  const bracket = AU_TAX_BRACKETS.find(
    b => yearlyGross >= b.min && yearlyGross <= b.max
  )

  if (!bracket) return 0

  const taxableAboveMin = yearlyGross - bracket.min + (bracket.min === 0 ? 0 : 1)
  const tax = bracket.base + taxableAboveMin * bracket.rate

  const lito = calculateLITO(yearlyGross)
  return Math.max(0, tax - lito)
}

/**
 * Estimate net pay from a gross amount at a given frequency.
 * Applies AU 2024–25 income tax + Medicare levy + LITO.
 *
 * @param {number} grossAmount
 * @param {'yearly'|'monthly'|'fortnightly'} frequency
 * @returns {{ netAmount, taxAmount, medicareLevy, effectiveTaxRate }}
 */
export function estimateNetPay(grossAmount, frequency) {
  if (!grossAmount || grossAmount <= 0) {
    return { netAmount: 0, taxAmount: 0, medicareLevy: 0, effectiveTaxRate: 0 }
  }

  const yearlyGross = normaliseToFrequency(grossAmount, frequency, 'yearly')

  const incomeTax = calculateIncomeTax(yearlyGross)
  const medicareLevy = yearlyGross * MEDICARE_LEVY_RATE
  const totalTax = incomeTax + medicareLevy
  const yearlyNet = yearlyGross - totalTax

  const periodsPerYear = PERIODS_PER_YEAR[frequency]
  const netAmount = yearlyNet / periodsPerYear
  const taxAmount = incomeTax / periodsPerYear
  const medicareLevyPerPeriod = medicareLevy / periodsPerYear
  const effectiveTaxRate = yearlyGross > 0 ? (totalTax / yearlyGross) * 100 : 0

  return {
    netAmount,
    taxAmount,
    medicareLevy: medicareLevyPerPeriod,
    effectiveTaxRate,
  }
}

/**
 * Back-calculate yearly gross from a yearly net amount using binary search.
 * Used when the user enters take-home pay and we need the gross for super purposes.
 *
 * @param {number} yearlyNet
 * @returns {number} estimated yearly gross
 */
export function estimateGrossFromNet(yearlyNet) {
  if (!yearlyNet || yearlyNet <= 0) return 0

  let lo = yearlyNet        // gross is always >= net
  let hi = yearlyNet * 2.5 // upper bound: covers ~60% effective rate

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    // estimateNetPay with 'yearly' returns netAmount as the yearly net (periodsPerYear = 1)
    const { netAmount: estimatedNet } = estimateNetPay(mid, 'yearly')
    if (estimatedNet < yearlyNet) {
      lo = mid
    } else {
      hi = mid
    }
    if (hi - lo < 0.01) break
  }

  return (lo + hi) / 2
}
