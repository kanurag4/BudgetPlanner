import { describe, it, expect } from 'vitest'
import { normaliseToFrequency, resolveSalaryCycle } from './normalise'

describe('normaliseToFrequency', () => {
  it('yearly → monthly: divides by 12', () => {
    expect(normaliseToFrequency(12000, 'yearly', 'monthly')).toBeCloseTo(1000)
  })

  it('yearly → fortnightly: divides by 26', () => {
    expect(normaliseToFrequency(26000, 'yearly', 'fortnightly')).toBeCloseTo(1000)
  })

  it('monthly → fortnightly', () => {
    expect(normaliseToFrequency(1000, 'monthly', 'fortnightly')).toBeCloseTo(461.538, 2)
  })

  it('fortnightly → monthly', () => {
    expect(normaliseToFrequency(1000, 'fortnightly', 'monthly')).toBeCloseTo(2166.667, 2)
  })

  it('quarterly → fortnightly', () => {
    expect(normaliseToFrequency(1300, 'quarterly', 'fortnightly')).toBeCloseTo(200, 2)
  })

  it('fortnightly → yearly', () => {
    expect(normaliseToFrequency(1000, 'fortnightly', 'yearly')).toBeCloseTo(26000)
  })

  it('monthly → yearly: multiplies by 12', () => {
    expect(normaliseToFrequency(500, 'monthly', 'yearly')).toBeCloseTo(6000)
  })

  it('same frequency returns the same amount', () => {
    expect(normaliseToFrequency(750, 'monthly', 'monthly')).toBe(750)
    expect(normaliseToFrequency(750, 'fortnightly', 'fortnightly')).toBe(750)
    expect(normaliseToFrequency(750, 'yearly', 'yearly')).toBe(750)
  })

  it('zero amount returns zero', () => {
    expect(normaliseToFrequency(0, 'yearly', 'monthly')).toBe(0)
  })
})

describe('resolveSalaryCycle', () => {
  it('returns fortnightly when salary is fortnightly', () => {
    expect(resolveSalaryCycle('fortnightly')).toBe('fortnightly')
  })

  it('returns monthly for monthly salary', () => {
    expect(resolveSalaryCycle('monthly')).toBe('monthly')
  })

  it('returns monthly for yearly salary', () => {
    expect(resolveSalaryCycle('yearly')).toBe('monthly')
  })

  it('returns weekly when salary is weekly', () => {
    expect(resolveSalaryCycle('weekly')).toBe('weekly')
  })
})
