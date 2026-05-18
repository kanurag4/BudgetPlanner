import { describe, it, expect } from 'vitest'
import { estimateNetPay, estimateGrossFromNet } from './taxEstimator'

// AU 2025-26 rates: 0% / 16% / 30% / 37% / 45%
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

  it('income in 16% bracket ($30,000 yearly)', () => {
    const result = estimateNetPay(30000, 'yearly')
    // Tax: 16% on (30000 - 18200) = $1,888, LITO $700.
    // After LITO: $1,188 + Medicare $600 = $1,788 total -> net $28,212.
    expect(result.taxAmount).toBeCloseTo(1188, 0)
    expect(result.netAmount).toBeCloseTo(28212, 0)
  })

  it('income at $45,000 bracket boundary', () => {
    const result = estimateNetPay(45000, 'yearly')
    // Tax: 16% on 26,800 = $4,288, LITO partially phased out (~$325).
    // After LITO: $3,963 + Medicare $900 -> effective ~10.8%.
    expect(result.effectiveTaxRate).toBeGreaterThan(10)
    expect(result.effectiveTaxRate).toBeLessThan(12)
  })

  it('income at $120,000 (within 30% bracket)', () => {
    const result = estimateNetPay(120000, 'yearly')
    // Tax: 4,288 + (120,000-45,000)*0.30 = $26,788.
    // Medicare: $2,400 -> total $29,188 -> net $90,812.
    expect(result.effectiveTaxRate).toBeCloseTo(24.3, 0)
    expect(result.netAmount).toBeCloseTo(90812, -2)
  })

  it('income at $180,000 (within 37% bracket)', () => {
    const result = estimateNetPay(180000, 'yearly')
    // Tax: 31,288 + (180,000-135,000)*0.37 = $47,938.
    // Medicare: $3,600 -> total $51,538 -> net $128,462.
    expect(result.effectiveTaxRate).toBeCloseTo(28.6, 0)
    expect(result.netAmount).toBeCloseTo(128462, -2)
  })

  it('high income above $190,000', () => {
    const result = estimateNetPay(250000, 'yearly')
    // Tax: 51,638 + (250,000-190,000)*0.45 = $78,638.
    // Medicare: $5,000 -> total $83,638 -> net $166,362.
    expect(result.effectiveTaxRate).toBeCloseTo(33.5, 0)
    expect(result.netAmount).toBeCloseTo(166362, -2)
  })

  it('LITO reduces tax for low incomes ($20,000)', () => {
    const low = estimateNetPay(20000, 'yearly')
    const mid = estimateNetPay(80000, 'yearly')
    expect(low.effectiveTaxRate).toBeLessThan(mid.effectiveTaxRate)
  })

  it('fortnightly gross input returns fortnightly net', () => {
    const yearlyResult = estimateNetPay(80000, 'yearly')
    const fortnightlyResult = estimateNetPay(80000 / 26, 'fortnightly')

    expect(fortnightlyResult.netAmount).toBeCloseTo(yearlyResult.netAmount / 26, 0)
  })

  it('monthly gross input returns monthly net', () => {
    const yearlyResult = estimateNetPay(60000, 'yearly')
    const monthlyResult = estimateNetPay(60000 / 12, 'monthly')

    expect(monthlyResult.netAmount).toBeCloseTo(yearlyResult.netAmount / 12, 0)
  })

  it('weekly gross input returns weekly net', () => {
    const yearlyResult = estimateNetPay(104000, 'yearly')
    const weeklyResult = estimateNetPay(104000 / 52, 'weekly')

    expect(weeklyResult.netAmount).toBeCloseTo(yearlyResult.netAmount / 52, 0)
  })

  it('netAmount + taxAmount + medicareLevy equals grossAmount for yearly input', () => {
    const gross = 90000
    const result = estimateNetPay(gross, 'yearly')
    const reconstructed = result.netAmount + result.taxAmount + result.medicareLevy
    expect(reconstructed).toBeCloseTo(gross, 0)
  })
})

describe('2025-26 tax bracket boundaries', () => {
  it('first bracket is 16% for the current 2025-26 income year', () => {
    const result = estimateNetPay(30000, 'yearly')
    expect(result.taxAmount).toBeCloseTo(1188, 0)
  })

  it('$135,001 is in the 37% bracket', () => {
    const justBelow = estimateNetPay(135000, 'yearly')
    const justAbove = estimateNetPay(136000, 'yearly')
    // Extra $1,000 taxed at 37% + 2% Medicare = 39% -> net gain is $610.
    const netGain = justAbove.netAmount - justBelow.netAmount
    expect(netGain).toBeGreaterThan(600)
    expect(netGain).toBeLessThan(620)
  })

  it('$190,001 enters the 45% bracket', () => {
    const at190 = estimateNetPay(190000, 'yearly')
    const at191 = estimateNetPay(191000, 'yearly')
    // Extra $1,000 taxed at 45% + 2% Medicare = 47% -> net gain is $530.
    const netGain = at191.netAmount - at190.netAmount
    expect(netGain).toBeGreaterThan(520)
    expect(netGain).toBeLessThan(540)
  })
})

describe('estimateGrossFromNet', () => {
  it('round-trips correctly from gross to net to gross', () => {
    for (const gross of [30000, 60000, 90000, 120000, 180000, 250000]) {
      const { netAmount } = estimateNetPay(gross, 'yearly')
      const recovered = estimateGrossFromNet(netAmount)
      expect(recovered).toBeCloseTo(gross, 0)
    }
  })

  it('returns 0 for zero input', () => {
    expect(estimateGrossFromNet(0)).toBe(0)
  })

  it('recovered gross is always greater than net', () => {
    const net = 75000
    const gross = estimateGrossFromNet(net)
    expect(gross).toBeGreaterThan(net)
  })
})
