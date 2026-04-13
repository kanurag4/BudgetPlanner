import { describe, it, expect } from 'vitest'
import { calculateBudget } from './calculations'

// Helper to build minimal state
function makeState(overrides = {}) {
  return {
    income: {
      primarySalary: { amount: 6000, frequency: 'monthly', isGross: false },
      partnerSalary: { enabled: false, amount: 0, frequency: 'monthly', isGross: false },
      bonus: { amount: 0 },
    },
    housing: { type: 'rent', amount: 1500, frequency: 'monthly' },
    groceries: { amount: 600, frequency: 'monthly' },
    fixedExpenses: [],
    savingsGoal: { enabled: false, type: 'percentage', value: 0, frequency: 'monthly' },
    splitSliders: { splurge: 20, emergency: 40, investment: 40 },
    scenario: { active: false, overrides: {} },
    ...overrides,
  }
}

describe('calculateBudget — basic case', () => {
  it('computes correct per-cycle bucket totals (monthly salary)', () => {
    const result = calculateBudget(makeState())
    expect(result.salaryCycle).toBe('monthly')
    expect(result.netIncomePerCycle).toBeCloseTo(6000)
    expect(result.housingPerCycle).toBeCloseTo(1500)
    expect(result.groceriesPerCycle).toBeCloseTo(600)
    expect(result.regularBucket).toBeCloseTo(2100)
    expect(result.fixedBucket).toBeCloseTo(0)
    expect(result.actualSavings).toBeCloseTo(3900)
  })

  it('salary cycle is fortnightly when salary frequency is fortnightly', () => {
    const state = makeState({
      income: {
        primarySalary: { amount: 3000, frequency: 'fortnightly', isGross: false },
        partnerSalary: { enabled: false, amount: 0, frequency: 'monthly', isGross: false },
        bonus: { amount: 0 },
      },
    })
    const result = calculateBudget(state)
    expect(result.salaryCycle).toBe('fortnightly')
    expect(result.periodsPerYear).toBe(26)
  })
})

describe('calculateBudget — fixed expenses', () => {
  it('sums fixed expenses normalised to salary cycle', () => {
    const state = makeState({
      fixedExpenses: [
        { id: '1', name: 'Netflix', amount: 180, frequency: 'yearly' },
        { id: '2', name: 'Gym', amount: 60, frequency: 'monthly' },
      ],
    })
    const result = calculateBudget(state)
    // 180/12 = 15 + 60 = 75 per month
    expect(result.fixedBucket).toBeCloseTo(75)
  })

  it('zero fixed expenses → fixedBucket is 0', () => {
    const result = calculateBudget(makeState({ fixedExpenses: [] }))
    expect(result.fixedBucket).toBe(0)
  })

  it('quarterly expense normalises correctly', () => {
    const state = makeState({
      fixedExpenses: [{ id: '1', name: 'Insurance', amount: 300, frequency: 'quarterly' }],
    })
    const result = calculateBudget(state)
    // 300 * 4 / 12 = 100/month
    expect(result.fixedBucket).toBeCloseTo(100)
  })
})

describe('calculateBudget — bonus', () => {
  it('bonus is kept separate from cycle income', () => {
    const state = makeState({
      income: {
        primarySalary: { amount: 6000, frequency: 'monthly', isGross: false },
        partnerSalary: { enabled: false, amount: 0, frequency: 'monthly', isGross: false },
        bonus: { amount: 12000 },
      },
    })
    const result = calculateBudget(state)
    // Bonus is NOT folded into cycle income
    expect(result.bonusPerCycle).toBeCloseTo(1000)
    expect(result.bonusAnnual).toBeCloseTo(12000)
    expect(result.netIncomePerCycle).toBeCloseTo(6000)
    // With-bonus view adds the spread bonus back
    expect(result.netIncomeWithBonusPerCycle).toBeCloseTo(7000)
    expect(result.savingsRateWithBonus).toBeGreaterThan(result.savingsRate)
  })
})

describe('calculateBudget — over-budget', () => {
  it('actualSavings is negative when expenses exceed income', () => {
    const state = makeState({
      housing: { type: 'rent', amount: 5500, frequency: 'monthly' },
      groceries: { amount: 1000, frequency: 'monthly' },
    })
    const result = calculateBudget(state)
    expect(result.actualSavings).toBeLessThan(0)
  })
})

describe('calculateBudget — partner income', () => {
  it('adds partner net income to total when enabled', () => {
    const state = makeState({
      income: {
        primarySalary: { amount: 6000, frequency: 'monthly', isGross: false },
        partnerSalary: { enabled: true, amount: 4000, frequency: 'monthly', isGross: false },
        bonus: { amount: 0 },
      },
    })
    const result = calculateBudget(state)
    expect(result.netIncomePerCycle).toBeCloseTo(10000)
    expect(result.partnerNetPerCycle).toBeCloseTo(4000)
  })

  it('ignores partner amount when disabled', () => {
    const state = makeState({
      income: {
        primarySalary: { amount: 6000, frequency: 'monthly', isGross: false },
        partnerSalary: { enabled: false, amount: 4000, frequency: 'monthly', isGross: false },
        bonus: { amount: 0 },
      },
    })
    const result = calculateBudget(state)
    expect(result.netIncomePerCycle).toBeCloseTo(6000)
    expect(result.partnerNetPerCycle).toBeCloseTo(0)
  })
})

describe('calculateBudget — scenario mode', () => {
  it('applies salary override when useScenario=true', () => {
    const state = makeState({
      scenario: {
        active: true,
        overrides: { primarySalary: 8000, partnerSalary: null, housingAmount: null },
      },
    })
    const baseline = calculateBudget(state, false)
    const scenario = calculateBudget(state, true)
    expect(baseline.netIncomePerCycle).toBeCloseTo(6000)
    expect(scenario.netIncomePerCycle).toBeCloseTo(8000)
  })

  it('applies housing override when useScenario=true', () => {
    const state = makeState({
      scenario: {
        active: true,
        overrides: { primarySalary: null, partnerSalary: null, housingAmount: 2000 },
      },
    })
    const baseline = calculateBudget(state, false)
    const scenario = calculateBudget(state, true)
    expect(baseline.housingPerCycle).toBeCloseTo(1500)
    expect(scenario.housingPerCycle).toBeCloseTo(2000)
  })

  it('base state is unchanged after scenario run', () => {
    const state = makeState({
      scenario: {
        active: true,
        overrides: { primarySalary: 9000, partnerSalary: null, housingAmount: null },
      },
    })
    calculateBudget(state, true)
    expect(state.income.primarySalary.amount).toBe(6000)
  })
})

describe('calculateBudget — annual values', () => {
  it('annual values = per-cycle × periodsPerYear', () => {
    const result = calculateBudget(makeState())
    expect(result.netIncomeAnnual).toBeCloseTo(result.netIncomePerCycle * 12)
    expect(result.regularBucketAnnual).toBeCloseTo(result.regularBucket * 12)
    expect(result.fixedBucketAnnual).toBeCloseTo(result.fixedBucket * 12)
    expect(result.actualSavingsAnnual).toBeCloseTo(result.actualSavings * 12)
  })
})

describe('calculateBudget — savings goal', () => {
  it('percentage savings goal = correct % of net income', () => {
    const state = makeState({
      savingsGoal: { enabled: true, type: 'percentage', value: 20, frequency: 'monthly' },
    })
    const result = calculateBudget(state)
    expect(result.savingsGoalAmount).toBeCloseTo(6000 * 0.2)
  })

  it('flat savings goal is normalised to salary cycle', () => {
    const state = makeState({
      savingsGoal: { enabled: true, type: 'flat', value: 12000, frequency: 'yearly' },
    })
    const result = calculateBudget(state)
    expect(result.savingsGoalAmount).toBeCloseTo(1000) // 12000/12
  })

  it('disabled savings goal → savingsGoalAmount is 0', () => {
    const state = makeState({
      savingsGoal: { enabled: false, type: 'percentage', value: 20, frequency: 'monthly' },
    })
    const result = calculateBudget(state)
    expect(result.savingsGoalAmount).toBe(0)
  })
})

describe('calculateBudget — split sliders', () => {
  it('split amounts sum to actualSavings', () => {
    const result = calculateBudget(makeState())
    const { splurge, emergency, investment } = result.splitAmounts
    expect(splurge + emergency + investment).toBeCloseTo(result.actualSavings)
  })

  it('custom slider values produce correct split', () => {
    const state = makeState({
      splitSliders: { splurge: 10, emergency: 50, investment: 40 },
    })
    const result = calculateBudget(state)
    expect(result.splitAmounts.splurge).toBeCloseTo(result.actualSavings * 0.1)
    expect(result.splitAmounts.emergency).toBeCloseTo(result.actualSavings * 0.5)
    expect(result.splitAmounts.investment).toBeCloseTo(result.actualSavings * 0.4)
  })
})
