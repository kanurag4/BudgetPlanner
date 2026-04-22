import { useState, useEffect } from 'react'
import { useBudget } from '../../hooks/useBudget'
import { calculateBudget } from '../../engine/calculations'
import { Card } from '../ui/Card'
import { Toggle } from '../ui/Toggle'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'

function OverrideInput({ label, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">
          $
        </span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
          placeholder={placeholder}
          className={[
            'w-full pl-7 pr-3 py-2 rounded-xl border text-sm min-h-[44px]',
            'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
            'text-slate-800 dark:text-slate-100 placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent',
          ].join(' ')}
        />
      </div>
    </div>
  )
}

function DeltaRow({ label, base, scenario, format = 'currency' }) {
  const delta = scenario - base
  const hasChange = Math.abs(delta) > 0.5
  const fmt = format === 'percent'
    ? v => `${v.toFixed(1)}%`
    : formatCurrency

  return (
    <div className="flex items-center justify-between gap-3 text-xs py-1">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-2 tabular-nums">
        <span className="text-slate-400 dark:text-slate-500 line-through">{fmt(base)}</span>
        <span className="text-slate-800 dark:text-slate-100 font-semibold">{fmt(scenario)}</span>
        {hasChange && (
          <span className={delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
            {delta > 0 ? '+' : ''}{fmt(delta)}
          </span>
        )}
      </div>
    </div>
  )
}

export function ScenarioPanel() {
  const { state, actions } = useBudget()
  const { scenario, income, housing } = state

  const isActive = scenario?.active ?? false
  const overrides = scenario?.overrides ?? {}

  // Local input strings (so user can type freely before the number is valid)
  const [inputs, setInputs] = useState({
    primarySalary: overrides.primarySalary != null ? String(overrides.primarySalary) : '',
    partnerSalary: overrides.partnerSalary != null ? String(overrides.partnerSalary) : '',
    housingAmount: overrides.housingAmount != null ? String(overrides.housingAmount) : '',
  })

  // Sync overrides → inputs when scenario is cleared externally
  useEffect(() => {
    if (!isActive && !overrides.primarySalary && !overrides.partnerSalary && !overrides.housingAmount) {
      setInputs({ primarySalary: '', partnerSalary: '', housingAmount: '' })
    }
  }, [isActive, overrides.primarySalary, overrides.partnerSalary, overrides.housingAmount])

  function handleToggle(checked) {
    actions.updateScenario({ active: checked })
  }

  function handleInput(key, raw) {
    setInputs(prev => ({ ...prev, [key]: raw }))
    const num = parseFloat(raw)
    actions.setScenarioOverride({ [key]: isNaN(num) || raw === '' ? null : num })
  }

  function handleReset() {
    actions.clearScenario()
    setInputs({ primarySalary: '', partnerSalary: '', housingAmount: '' })
  }

  // Compute comparison budgets for the delta table
  const baseBudget     = calculateBudget(state, false)
  const scenarioBudget = isActive ? calculateBudget(state, true) : null

  const cycleLabel = baseBudget.salaryCycle === 'fortnightly' ? 'fortnight' : 'month'

  // Placeholder hints (current base values per cycle)
  const primaryHint  = formatCurrency(baseBudget.primaryNetPerCycle).replace('$', '')
  const partnerHint  = formatCurrency(baseBudget.partnerNetPerCycle).replace('$', '')
  const housingHint  = formatCurrency(baseBudget.housingPerCycle).replace('$', '')

  return (
    <Card>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            What-if scenario
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Override values to see how your budget changes. Not saved.
          </p>
        </div>
        <Toggle
          id="scenario-toggle"
          checked={isActive}
          onChange={handleToggle}
          label=""
        />
      </div>

      {/* Inputs — always visible so user can pre-fill before activating */}
      <div className="flex flex-col gap-3">
        <OverrideInput
          label={`Primary salary (net, per ${cycleLabel})`}
          placeholder={primaryHint}
          value={inputs.primarySalary}
          onChange={v => handleInput('primarySalary', v)}
        />
        {income.partnerSalary.enabled && (
          <OverrideInput
            label={`Partner salary (net, per ${cycleLabel})`}
            placeholder={partnerHint}
            value={inputs.partnerSalary}
            onChange={v => handleInput('partnerSalary', v)}
          />
        )}
        <OverrideInput
          label={`${housing.type === 'loan' ? 'Mortgage' : 'Rent'} (per ${cycleLabel})`}
          placeholder={housingHint}
          value={inputs.housingAmount}
          onChange={v => handleInput('housingAmount', v)}
        />
      </div>

      {/* Delta comparison — only when active and scenario differs */}
      {isActive && scenarioBudget && (
        <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 px-3 py-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wide">
            Scenario impact (per {cycleLabel})
          </p>
          <DeltaRow
            label="Net income"
            base={baseBudget.netIncomePerCycle}
            scenario={scenarioBudget.netIncomePerCycle}
          />
          <DeltaRow
            label="Housing"
            base={baseBudget.housingPerCycle}
            scenario={scenarioBudget.housingPerCycle}
          />
          <DeltaRow
            label="Savings"
            base={baseBudget.actualSavings}
            scenario={scenarioBudget.actualSavings}
          />
          <DeltaRow
            label="Savings rate"
            base={baseBudget.savingsRate}
            scenario={scenarioBudget.savingsRate}
            format="percent"
          />
        </div>
      )}

      {/* Reset */}
      {(inputs.primarySalary || inputs.partnerSalary || inputs.housingAmount) && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-slate-400 dark:text-slate-500"
          onClick={handleReset}
        >
          Reset scenario
        </Button>
      )}
    </Card>
  )
}
