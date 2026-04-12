import { describe, it, expect } from 'vitest'
import { estimateNetPay } from './taxEstimator'

// AU 2025–26 rates: 0% / 15% / 30% / 37% / 45%
// Bracket boundaries: 18,200 / 45,000 / 135,000 / 190,000

describe('estimateNetPay', () => {
  it('zero income returns all zeros', () => {
    const result = estimateNetPay(0, 'yearly')
    expect(result.netAmount).toBe(0)
    expect(result.taxAmount).toBe(0)
    expect(result.medicareLevy).toBe(0)
    expect(result.effectiveTaxRate).toBe(0)
  })

  it('income at tax-free threshold ($18,200) has zero income tax', () => {
    const result = estimateNetPay(18200, 'yearly')
    expect(result.taxAmount).toBeCloseTo(0, 0)
  })

  it('Medicare levy applies at 2% of gross', () => {
    const result = estimateNetPay(18200, 'yearly')
    expect(result.medicareLevy).toBeCloseTo(18200 * 0.02, 0)
  })

  it('income in 15% bracket ($30,000 yearly)', () => {
    const result = estimateNetPay(30000, 'yearly')
    // Tax: 15% on (30000 - 18200) = $1,770, LITO $700 (income < $37,500 → full offset)
    // After LITO: $1,070 + Medicare $600 = $1,670 total → net $28,330
    expect(result.netAmount).toBeGreaterThan(27000)
    expect(result.netAmount).toBeLessThan(29500)
  })

  it('income at $45,000 bracket boundary', () => {
    const result = estimateNetPay(45000, 'yearly')
    // Tax: 15% on 26,800 = $4,020, LITO partially phased out (~$325)
    // After LITO: $3,695 + Medicare $900 → effective ~10.2%
    expect(result.effectiveTaxRate).toBeGreaterThan(9)
    expect(result.effectiveTaxRate).toBeLessThan(13)
  })

  it('income at $120,000 (within 30% bracket)', () => {
    const result = estimateNetPay(120000, 'yearly')
    // Tax: 4,020 + (120,000-45,000)*0.30 = 4,020 + 22,500 = $26,520
    // Medicare: $2,400 → total $28,920 → effective ~24.1%
    expect(result.effectiveTaxRate).toBeCloseTo(24.1, 0)
    expect(result.netAmount).toBeCloseTo(91080, -2)
  })

  it('income at $180,000 (within 37% bracket)', () => {
    const result = estimateNetPay(180000, 'yearly')
    // Tax: 31,020 + (180,000-135,000)*0.37 = 31,020 + 16,650 = $47,670
    // Medicare: $3,600 → total $51,270 → effective ~28.5%
    expect(result.effectiveTaxRate).toBeCloseTo(28.5, 0)
    expect(result.netAmount).toBeCloseTo(128730, -2)
  })

  it('high income above $190,000', () => {
    const result = estimateNetPay(250000, 'yearly')
    // Tax: 51,370 + (250,000-190,000)*0.45 = 51,370 + 27,000 = $78,370
    // Medicare: $5,000 → total $83,370 → effective ~33.3%
    expect(result.effectiveTaxRate).toBeCloseTo(33.3, 0)
    expect(result.netAmount).toBeCloseTo(166630, -2)
  })

  it('LITO reduces tax for low incomes ($20,000)', () => {
    const low = estimateNetPay(20000, 'yearly')
    const mid = estimateNetPay(80000, 'yearly')
    // Low income should have a lower effective rate due to LITO
    expect(low.effectiveTaxRate).toBeLessThan(mid.effectiveTaxRate)
  })

  it('fortnightly gross input returns fortnightly net', () => {
    // $80,000/year = ~$3,076.92/fortnight
    const yearlyResult = estimateNetPay(80000, 'yearly')
    const fortnightlyResult = estimateNetPay(80000 / 26, 'fortnightly')

    expect(fortnightlyResult.netAmount).toBeCloseTo(yearlyResult.netAmount / 26, 0)
  })

  it('monthly gross input returns monthly net', () => {
    const yearlyResult = estimateNetPay(60000, 'yearly')
    const monthlyResult = estimateNetPay(60000 / 12, 'monthly')

    expect(monthlyResult.netAmount).toBeCloseTo(yearlyResult.netAmount / 12, 0)
  })

  it('netAmount + taxAmount + medicareLevy ≈ grossAmount (yearly)', () => {
    const gross = 90000
    const result = estimateNetPay(gross, 'yearly')
    const reconstructed = result.netAmount + result.taxAmount + result.medicareLevy
    expect(reconstructed).toBeCloseTo(gross, 0)
  })
})
