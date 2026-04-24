// Frequency definitions
export const FREQUENCIES = {
  yearly: { label: 'Yearly', periodsPerYear: 1 },
  quarterly: { label: 'Quarterly', periodsPerYear: 4 },
  monthly: { label: 'Monthly', periodsPerYear: 12 },
  fortnightly: { label: 'Fortnightly', periodsPerYear: 26 },
  weekly: { label: 'Weekly', periodsPerYear: 52 },
}

export const PERIODS_PER_YEAR = {
  yearly: 1,
  quarterly: 4,
  monthly: 12,
  fortnightly: 26,
  weekly: 52,
}

export const INCOME_FREQUENCIES = ['yearly', 'monthly', 'fortnightly', 'weekly']
export const EXPENSE_FREQUENCIES = ['yearly', 'quarterly', 'monthly', 'fortnightly', 'weekly']
export const HOUSING_FREQUENCIES = ['monthly', 'fortnightly', 'weekly']

// AU tax brackets — 2025–26 rates (applicable from 1 July 2025)
// Scheduled changes: 2026–27 → first bracket drops to 14%
// Format: { min, max, rate, base } where base = total tax owed at the bottom of the bracket
export const AU_TAX_BRACKETS = [
  { min: 0,      max: 18200,    rate: 0,    base: 0 },
  { min: 18200,  max: 45000,    rate: 0.15, base: 0 },      // (45000-18200)*0.15 = 4,020 at top
  { min: 45000,  max: 135000,   rate: 0.30, base: 4020 },   // (135000-45000)*0.30 = 27,000 → top: 31,020
  { min: 135000, max: 190000,   rate: 0.37, base: 31020 },  // (190000-135000)*0.37 = 20,350 → top: 51,370
  { min: 190000, max: Infinity, rate: 0.45, base: 51370 },
]

// Low Income Tax Offset (LITO) 2025–26
export const LITO = {
  maxOffset: 700,
  phase1Start: 37500,
  phase1End: 45000,
  phase1Rate: 0.05,   // reduces by 5c per $1 above $37,500
  phase2Start: 45000,
  phase2End: 66667,
  phase2Rate: 0.015,  // reduces by 1.5c per $1 above $45,000
}

export const MEDICARE_LEVY_RATE = 0.02

// Savings rate recommendations by age group
export const SAVINGS_RECOMMENDATIONS = {
  under25: 10,
  '25-34': 15,
  '35-44': 20,
  '45-54': 25,
  '55+': 30,
}

// Family situation adjustments to recommended savings rate
export const FAMILY_ADJUSTMENTS = {
  single: 0,
  couple: -2,
  'couple+kids': -2,  // same base as couple; kids add on top
}

// Per-kid reduction: −2% per kid, capped at −6% for kids alone.
// Combined with couple adjustment (−2%) this gives a max total of −8% from single.
export const PER_KID_ADJUSTMENT = -2
export const MIN_KID_ADJUSTMENT = -6  // floor: kids penalty capped at −6% regardless of count
export const SAVINGS_RATE_FLOOR = 5

// Alert severity thresholds (percentage points below recommended)
export const ALERT_THRESHOLDS = {
  green: 0,   // at or above recommended
  amber: -5,  // within 5% below
  // below -5 = red
}

// Employer superannuation rate (2025–26)
export const SUPER_RATE = 0.12

// Default split slider values
export const DEFAULT_SPLIT_SLIDERS = {
  splurge: 20,
  emergency: 40,
  investment: 40,
}

// Storage key
export const STORAGE_KEY = 'budgetplanner_v1'

// Wizard steps
export const WIZARD_STEPS = [
  { step: 1, route: '/wizard/income',    label: 'Income' },
  { step: 2, route: '/wizard/housing',   label: 'Housing' },
  { step: 3, route: '/wizard/groceries', label: 'Groceries' },
  { step: 4, route: '/wizard/fixed',     label: 'Fixed Expenses' },
  { step: 5, route: '/wizard/savings',   label: 'Savings Goal' },
  { step: 6, route: '/wizard/profile',   label: 'Profile' },
]

export const TOTAL_STEPS = WIZARD_STEPS.length

// Age group options
export const AGE_GROUPS = [
  { value: 'under25', label: 'Under 25' },
  { value: '25-34',   label: '25 – 34' },
  { value: '35-44',   label: '35 – 44' },
  { value: '45-54',   label: '45 – 54' },
  { value: '55+',     label: '55 or older' },
]

// Family situation options
export const FAMILY_SITUATIONS = [
  { value: 'single',      label: 'Single' },
  { value: 'couple',      label: 'Couple (no kids)' },
  { value: 'couple+kids', label: 'Couple with kids' },
]

// Default state shape
export const DEFAULT_STATE = {
  income: {
    primarySalary: { amount: '', frequency: 'monthly', isGross: false },
    partnerSalary: { enabled: false, amount: '', frequency: 'monthly', isGross: false },
    bonus: { amount: '' },
  },
  housing: {
    type: 'rent',
    amount: '',
    frequency: 'monthly',
    vehicleLoan:      { enabled: false, amount: '', frequency: 'monthly' },
    otherLoans:       { enabled: false, amount: '', frequency: 'monthly' },
    investmentLoans:  [],
    additionalLoans:  [],
  },
  groceries: { amount: '', frequency: 'monthly' },
  householdBills: {
    utilities:        { enabled: false, amount: '', frequency: 'monthly' },
    councilFees:      { enabled: false, amount: '', frequency: 'quarterly' },
    strataFees:       { enabled: false, amount: '', frequency: 'quarterly' },
    medicalInsurance: { enabled: false, amount: '', frequency: 'monthly' },
  },
  fixedExpenses: [],
  savingsGoal: { enabled: false, type: 'percentage', value: '', frequency: 'monthly' },
  profile: { familySituation: 'single', numberOfKids: 0, ageGroup: 'under25' },
  splitSliders: { ...DEFAULT_SPLIT_SLIDERS },
  dashboardView: 'cycle',
  darkMode: false,
  scenario: { active: false, overrides: { primarySalary: null, partnerSalary: null, housingAmount: null } },
  wizardStep: 1,
}
