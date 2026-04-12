import { createContext, useState } from 'react'
import { useStorage } from '../hooks/useStorage'
import { STORAGE_KEY, DEFAULT_STATE } from '../utils/constants'

export const BudgetContext = createContext(null)

// Scenario is session-only — strip it before persisting
const { scenario: _defaultScenario, ...DEFAULT_PERSISTED } = DEFAULT_STATE

/**
 * Redistribute the two other sliders proportionally when one changes,
 * so all three always sum to 100.
 */
function redistributeSliders(current, changedKey, newValue) {
  const clamped = Math.max(0, Math.min(100, newValue))
  const remaining = 100 - clamped
  const otherKeys = Object.keys(current).filter(k => k !== changedKey)
  const otherTotal = otherKeys.reduce((sum, k) => sum + current[k], 0)

  const next = { ...current, [changedKey]: clamped }

  if (otherTotal === 0) {
    // Both others were 0 — split remaining equally
    const share = remaining / otherKeys.length
    otherKeys.forEach(k => { next[k] = share })
  } else {
    // Proportional redistribution
    otherKeys.forEach(k => {
      next[k] = Math.round((current[k] / otherTotal) * remaining)
    })
    // Correct any rounding drift so the total is exactly 100
    const total = Object.values(next).reduce((a, b) => a + b, 0)
    const drift = 100 - total
    if (drift !== 0) next[otherKeys[0]] += drift
  }

  return next
}

export function BudgetProvider({ children }) {
  // Everything except scenario is persisted to localStorage
  const [persisted, setPersisted, clearPersisted] = useStorage(STORAGE_KEY, DEFAULT_PERSISTED)

  // Scenario is session-only — never touches localStorage
  const [scenario, setScenarioState] = useState(DEFAULT_STATE.scenario)

  // Merge for consumers
  const state = { ...persisted, scenario }

  // ── Helpers ──────────────────────────────────────────────────────────────

  function patch(key, value) {
    setPersisted(prev => ({ ...prev, [key]: value }))
  }

  function patchNested(key, subPatch) {
    setPersisted(prev => ({
      ...prev,
      [key]: { ...prev[key], ...subPatch },
    }))
  }

  // ── Income ────────────────────────────────────────────────────────────────

  function updatePrimarySalary(subPatch) {
    setPersisted(prev => ({
      ...prev,
      income: {
        ...prev.income,
        primarySalary: { ...prev.income.primarySalary, ...subPatch },
      },
    }))
  }

  function updatePartnerSalary(subPatch) {
    setPersisted(prev => ({
      ...prev,
      income: {
        ...prev.income,
        partnerSalary: { ...prev.income.partnerSalary, ...subPatch },
      },
    }))
  }

  function updateBonus(subPatch) {
    setPersisted(prev => ({
      ...prev,
      income: {
        ...prev.income,
        bonus: { ...prev.income.bonus, ...subPatch },
      },
    }))
  }

  // ── Housing / Groceries ───────────────────────────────────────────────────

  function updateHousing(subPatch) { patchNested('housing', subPatch) }
  function updateGroceries(subPatch) { patchNested('groceries', subPatch) }

  // ── Fixed expenses ────────────────────────────────────────────────────────

  function addFixedExpense(expense) {
    const id = crypto.randomUUID()
    setPersisted(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, { id, ...expense }],
    }))
  }

  function updateFixedExpense(id, subPatch) {
    setPersisted(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(e =>
        e.id === id ? { ...e, ...subPatch } : e
      ),
    }))
  }

  function removeFixedExpense(id) {
    setPersisted(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter(e => e.id !== id),
    }))
  }

  // ── Savings goal ──────────────────────────────────────────────────────────

  function updateHouseholdBill(key, subPatch) {
    setPersisted(prev => ({
      ...prev,
      householdBills: {
        ...prev.householdBills,
        [key]: { ...prev.householdBills?.[key], ...subPatch },
      },
    }))
  }

  function updateSavingsGoal(subPatch) { patchNested('savingsGoal', subPatch) }

  // ── Profile ───────────────────────────────────────────────────────────────

  function updateProfile(subPatch) { patchNested('profile', subPatch) }

  // ── Split sliders — redistribution logic lives here, not in the component ─

  function updateSplitSlider(key, value) {
    setPersisted(prev => ({
      ...prev,
      splitSliders: redistributeSliders(prev.splitSliders, key, value),
    }))
  }

  // ── Dashboard view toggle ─────────────────────────────────────────────────

  function setDashboardView(view) { patch('dashboardView', view) }

  // ── Wizard step ───────────────────────────────────────────────────────────

  function setWizardStep(step) { patch('wizardStep', step) }

  // ── Scenario (session-only) ───────────────────────────────────────────────

  function updateScenario(subPatch) {
    setScenarioState(prev => ({ ...prev, ...subPatch }))
  }

  function setScenarioOverride(overridePatch) {
    setScenarioState(prev => ({
      ...prev,
      overrides: { ...prev.overrides, ...overridePatch },
    }))
  }

  function clearScenario() {
    setScenarioState(DEFAULT_STATE.scenario)
  }

  // ── Reset everything ──────────────────────────────────────────────────────

  function resetAll() {
    clearPersisted()
    setScenarioState(DEFAULT_STATE.scenario)
  }

  const actions = {
    updatePrimarySalary,
    updatePartnerSalary,
    updateBonus,
    updateHousing,
    updateGroceries,
    addFixedExpense,
    updateFixedExpense,
    removeFixedExpense,
    updateHouseholdBill,
    updateSavingsGoal,
    updateProfile,
    updateSplitSlider,
    setDashboardView,
    setWizardStep,
    updateScenario,
    setScenarioOverride,
    clearScenario,
    resetAll,
  }

  return (
    <BudgetContext.Provider value={{ state, actions }}>
      {children}
    </BudgetContext.Provider>
  )
}
