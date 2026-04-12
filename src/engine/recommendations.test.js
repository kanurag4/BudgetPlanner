import { describe, it, expect } from 'vitest'
import { getRecommendation } from './recommendations'

describe('getRecommendation — base rates by age group (single)', () => {
  it('under25 single → 10%', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: 'under25', familySituation: 'single', numberOfKids: 0 })
    expect(recommendedRate).toBe(10)
  })

  it('25-34 single → 15%', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: '25-34', familySituation: 'single', numberOfKids: 0 })
    expect(recommendedRate).toBe(15)
  })

  it('35-44 single → 20%', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: '35-44', familySituation: 'single', numberOfKids: 0 })
    expect(recommendedRate).toBe(20)
  })

  it('45-54 single → 25%', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: '45-54', familySituation: 'single', numberOfKids: 0 })
    expect(recommendedRate).toBe(25)
  })

  it('55+ single → 30%', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: '55+', familySituation: 'single', numberOfKids: 0 })
    expect(recommendedRate).toBe(30)
  })
})

describe('getRecommendation — family adjustments', () => {
  it('couple (no kids) reduces by 2%', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: '35-44', familySituation: 'couple', numberOfKids: 0 })
    expect(recommendedRate).toBe(18)
  })

  it('couple + 1 kid: −2% couple, −2% kid = −4% total', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: '35-44', familySituation: 'couple+kids', numberOfKids: 1 })
    expect(recommendedRate).toBe(16)
  })

  it('couple + 2 kids: −2% couple, −4% kids = −6% total', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: '35-44', familySituation: 'couple+kids', numberOfKids: 2 })
    expect(recommendedRate).toBe(14)
  })

  it('couple + 3 kids: −2% couple, −6% kids = −8% total (3 kids = max kid adjustment)', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: '35-44', familySituation: 'couple+kids', numberOfKids: 3 })
    expect(recommendedRate).toBe(12)
  })

  it('couple + 4 kids: kid adjustment capped at −8%', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: '35-44', familySituation: 'couple+kids', numberOfKids: 4 })
    expect(recommendedRate).toBe(12) // same as 3 kids — capped
  })
})

describe('getRecommendation — floor at 5%', () => {
  it('never returns below 5% even with many adjustments', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: 'under25', familySituation: 'couple+kids', numberOfKids: 4 })
    expect(recommendedRate).toBeGreaterThanOrEqual(5)
  })

  it('under25 couple + 3 kids: 10 - 2 - 6 = 2% → floor to 5%', () => {
    const { recommendedRate } = getRecommendation({ ageGroup: 'under25', familySituation: 'couple+kids', numberOfKids: 3 })
    expect(recommendedRate).toBe(5)
  })
})

describe('getRecommendation — alert severity', () => {
  it('at or above recommended → green', () => {
    const { severity } = getRecommendation(
      { ageGroup: '35-44', familySituation: 'single', numberOfKids: 0 },
      20
    )
    expect(severity).toBe('green')
  })

  it('above recommended → green', () => {
    const { severity } = getRecommendation(
      { ageGroup: '35-44', familySituation: 'single', numberOfKids: 0 },
      25
    )
    expect(severity).toBe('green')
  })

  it('exactly 5% below recommended → amber', () => {
    const { severity } = getRecommendation(
      { ageGroup: '35-44', familySituation: 'single', numberOfKids: 0 },
      15
    )
    expect(severity).toBe('amber')
  })

  it('1% below recommended → amber', () => {
    const { severity } = getRecommendation(
      { ageGroup: '35-44', familySituation: 'single', numberOfKids: 0 },
      19
    )
    expect(severity).toBe('amber')
  })

  it('more than 5% below recommended → red', () => {
    const { severity } = getRecommendation(
      { ageGroup: '35-44', familySituation: 'single', numberOfKids: 0 },
      14
    )
    expect(severity).toBe('red')
  })

  it('no actualRate → severity is null', () => {
    const { severity } = getRecommendation(
      { ageGroup: '35-44', familySituation: 'single', numberOfKids: 0 }
    )
    expect(severity).toBeNull()
  })

  it('shortfallNote is set when amber or red', () => {
    const { shortfallNote } = getRecommendation(
      { ageGroup: '35-44', familySituation: 'single', numberOfKids: 0 },
      14
    )
    expect(shortfallNote).toBeTruthy()
    expect(shortfallNote).toContain('below recommended')
  })

  it('shortfallNote is null when green', () => {
    const { shortfallNote } = getRecommendation(
      { ageGroup: '35-44', familySituation: 'single', numberOfKids: 0 },
      20
    )
    expect(shortfallNote).toBeNull()
  })
})
