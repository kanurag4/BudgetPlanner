import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBudget } from '../../hooks/useBudget'
import { estimateNetPay } from '../../engine/taxEstimator'
import { AmountFrequencyInput } from '../ui/AmountFrequencyInput'
import { Toggle } from '../ui/Toggle'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { InfoTooltip } from '../ui/Tooltip'
import { PayslipUploader } from './PayslipUploader'
import { PayslipReviewCard } from './PayslipReviewCard'
import { INCOME_FREQUENCIES } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'

export function StepIncome() {
  const navigate = useNavigate()
  const { state, actions } = useBudget()
  const { income } = state
  const { primarySalary, partnerSalary, bonus } = income

  const [showPayslip, setShowPayslip]           = useState(false)
  const [payslipResult, setPayslipResult]        = useState(null)
  const [partnerPayslipResult, setPartnerPayslipResult] = useState(null)
  const [showPartnerPayslip, setShowPartnerPayslip] = useState(false)

  // --- Tax breakdown for gross mode ---
  const primaryGrossAmt = parseFloat(primarySalary.amount) || 0
  const primaryTax = primarySalary.isGross && primaryGrossAmt > 0
    ? estimateNetPay(primaryGrossAmt, primarySalary.frequency)
    : null

  const partnerGrossAmt = parseFloat(partnerSalary.amount) || 0
  const partnerTax = partnerSalary.enabled && partnerSalary.isGross && partnerGrossAmt > 0
    ? estimateNetPay(partnerGrossAmt, partnerSalary.frequency)
    : null

  // --- Validation ---
  const canContinue = (parseFloat(primarySalary.amount) || 0) > 0

  function handleNext() {
    if (!canContinue) return
    actions.setWizardStep(2)
    navigate('/wizard/housing')
  }

  // --- Payslip handlers ---
  function handlePayslipResult(result) {
    setPayslipResult(result)
    setShowPayslip(false)
  }

  function applyPayslip(result) {
    actions.updatePrimarySalary({
      amount: String(result.netPay),
      frequency: result.frequency ?? primarySalary.frequency,
      isGross: false,
    })
    setPayslipResult(null)
  }

  function applyPartnerPayslip(result) {
    actions.updatePartnerSalary({
      amount: String(result.netPay),
      frequency: result.frequency ?? partnerSalary.frequency,
      isGross: false,
    })
    setPartnerPayslipResult(null)
  }

  const salaryCycle = primarySalary.frequency === 'fortnightly' ? 'fortnightly' : 'monthly'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          What does your take-home pay look like?
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter the amount you actually receive — after tax and super.
        </p>
      </div>

      {/* Primary salary */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your salary</h3>
            {!showPayslip && !payslipResult && (
              <button
                type="button"
                onClick={() => setShowPayslip(true)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium min-h-[36px] px-2"
              >
                Upload payslip
              </button>
            )}
          </div>

          {/* Payslip uploader */}
          {showPayslip && !payslipResult && (
            <div>
              <PayslipUploader onResult={handlePayslipResult} />
              <button
                type="button"
                onClick={() => setShowPayslip(false)}
                className="mt-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 min-h-[36px]"
              >
                Cancel
              </button>
            </div>
          )}

          {payslipResult && (
            <PayslipReviewCard
              result={payslipResult}
              onApply={applyPayslip}
              onDismiss={() => setPayslipResult(null)}
            />
          )}

          {/* Gross toggle */}
          <Toggle
            checked={primarySalary.isGross}
            onChange={val => actions.updatePrimarySalary({ isGross: val })}
            label="I know my gross salary instead"
            description="We'll estimate your after-tax take-home pay"
            id="primary-gross-toggle"
          />

          {/* Amount + frequency */}
          <AmountFrequencyInput
            id="primary-salary"
            label={primarySalary.isGross ? 'Gross salary' : 'Take-home pay (after tax)'}
            amount={primarySalary.amount}
            frequency={primarySalary.frequency}
            frequencies={INCOME_FREQUENCIES}
            salaryCycle={salaryCycle}
            onChange={({ amount, frequency }) =>
              actions.updatePrimarySalary({ amount, frequency })
            }
          />

          {/* Tax breakdown */}
          {primaryTax && (
            <div
              data-testid="primary-tax-breakdown"
              className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 text-xs flex flex-col gap-1.5"
            >
              <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">Estimated breakdown</p>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Gross</span>
                <span className="tabular-nums">{formatCurrency(primaryGrossAmt)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Income tax</span>
                <span className="tabular-nums text-rose-500">−{formatCurrency(primaryTax.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>
                  Medicare levy{' '}
                  <InfoTooltip content="A 2% levy that funds Australia's public health system (Medicare)." />
                </span>
                <span className="tabular-nums text-rose-500">−{formatCurrency(primaryTax.medicareLevy)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-100 border-t border-slate-200 dark:border-slate-600 pt-1.5 mt-0.5">
                <span>Est. take-home</span>
                <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(primaryTax.netAmount)}
                </span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">
                Effective tax rate: {primaryTax.effectiveTaxRate.toFixed(1)}% · AU 2025–26 estimate
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Partner salary toggle */}
      <Card>
        <div className="flex flex-col gap-4">
          <Toggle
            checked={partnerSalary.enabled}
            onChange={val => actions.updatePartnerSalary({ enabled: val })}
            label="Add partner's income"
            description="Include a second income in your household budget"
            id="partner-toggle"
          />

          {partnerSalary.enabled && (
            <div data-testid="partner-section" className="flex flex-col gap-4 pt-1 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Partner's salary</p>
                {!showPartnerPayslip && !partnerPayslipResult && (
                  <button
                    type="button"
                    onClick={() => setShowPartnerPayslip(true)}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium min-h-[36px] px-2"
                  >
                    Upload payslip
                  </button>
                )}
              </div>

              {showPartnerPayslip && !partnerPayslipResult && (
                <div>
                  <PayslipUploader onResult={r => { setPartnerPayslipResult(r); setShowPartnerPayslip(false) }} />
                  <button
                    type="button"
                    onClick={() => setShowPartnerPayslip(false)}
                    className="mt-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 min-h-[36px]"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {partnerPayslipResult && (
                <PayslipReviewCard
                  result={partnerPayslipResult}
                  onApply={applyPartnerPayslip}
                  onDismiss={() => setPartnerPayslipResult(null)}
                />
              )}

              <Toggle
                checked={partnerSalary.isGross}
                onChange={val => actions.updatePartnerSalary({ isGross: val })}
                label="I know their gross salary instead"
                id="partner-gross-toggle"
              />

              <AmountFrequencyInput
                id="partner-salary"
                label={partnerSalary.isGross ? 'Partner gross salary' : "Partner take-home pay"}
                amount={partnerSalary.amount}
                frequency={partnerSalary.frequency}
                frequencies={INCOME_FREQUENCIES}
                salaryCycle={salaryCycle}
                onChange={({ amount, frequency }) =>
                  actions.updatePartnerSalary({ amount, frequency })
                }
              />

              {partnerTax && (
                <div
                  data-testid="partner-tax-breakdown"
                  className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 text-xs flex flex-col gap-1.5"
                >
                  <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">Estimated breakdown</p>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Gross</span>
                    <span className="tabular-nums">{formatCurrency(partnerGrossAmt)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-100 border-t border-slate-200 dark:border-slate-600 pt-1.5 mt-0.5">
                    <span>Est. take-home</span>
                    <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(partnerTax.netAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Annual bonus */}
      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Annual bonus</h3>
            <InfoTooltip content="Any expected yearly bonus is spread evenly across your pay periods in the budget." />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 -mt-1">Optional — spread evenly across pay periods</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">$</span>
            <input
              id="bonus-amount"
              type="number"
              min="0"
              step="1"
              value={bonus.amount}
              onChange={e => actions.updateBonus({ amount: e.target.value })}
              placeholder="0"
              className={[
                'w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                'text-slate-800 dark:text-slate-100 placeholder-slate-400',
                'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent',
              ].join(' ')}
            />
          </div>
        </div>
      </Card>

      {/* Next */}
      <div className="pb-safe">
        <Button
          fullWidth
          size="lg"
          disabled={!canContinue}
          onClick={handleNext}
        >
          Next — Housing →
        </Button>
        {!canContinue && (
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
            Enter your salary to continue
          </p>
        )}
      </div>
    </div>
  )
}
