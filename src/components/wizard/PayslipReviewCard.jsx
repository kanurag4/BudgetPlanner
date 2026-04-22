import { useState } from 'react'
import { CheckCircle, AlertTriangle, X } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FREQUENCIES, INCOME_FREQUENCIES } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'

/**
 * Shows extracted payslip data for user confirmation before applying.
 *
 * Props:
 *   result   — { netPay, frequency, confidence, rawText } from parsePayslip
 *   onApply  — called with { netPay: number, frequency: string }
 *   onDismiss — called when user closes the card
 */
export function PayslipReviewCard({ result, onApply, onDismiss }) {
  const [netPay, setNetPay]       = useState(result.netPay ?? '')
  const [frequency, setFrequency] = useState(
    INCOME_FREQUENCIES.includes(result.frequency) ? result.frequency : 'monthly'
  )

  const isHighConfidence = result.confidence === 'high'
  const canApply = parseFloat(netPay) > 0

  function handleApply() {
    if (!canApply) return
    onApply({ netPay: parseFloat(netPay), frequency })
  }

  return (
    <Card className="relative">
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss payslip result"
        className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col gap-4 pr-6">
        {/* Confidence badge */}
        <div className="flex items-center gap-2">
          {isHighConfidence ? (
            <>
              <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Payslip read successfully
              </span>
            </>
          ) : (
            <>
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Couldn't read automatically — please enter below
              </span>
            </>
          )}
        </div>

        {/* Editable fields */}
        <div className="flex flex-col gap-3">
          {/* Net pay */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="payslip-net-pay"
              className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
            >
              Net (take-home) pay
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
                $
              </span>
              <input
                id="payslip-net-pay"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={netPay}
                onChange={e => setNetPay(e.target.value)}
                onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                placeholder="e.g. 4200"
                className={[
                  'w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                  'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                  'text-slate-800 dark:text-slate-100 placeholder-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent',
                ].join(' ')}
              />
            </div>
            {isHighConfidence && result.netPay && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Extracted: {formatCurrency(result.netPay)}
              </p>
            )}
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="payslip-frequency"
              className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
            >
              Pay frequency
            </label>
            <select
              id="payslip-frequency"
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className={[
                'w-full px-3 py-2.5 rounded-xl border text-sm min-h-[44px]',
                'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
                'text-slate-800 dark:text-slate-100',
                'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent',
              ].join(' ')}
            >
              {INCOME_FREQUENCIES.map(f => (
                <option key={f} value={f}>
                  {FREQUENCIES[f]?.label ?? f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            disabled={!canApply}
            fullWidth
            size="md"
          >
            Apply to my budget
          </Button>
          <Button
            variant="secondary"
            onClick={onDismiss}
            size="md"
            className="flex-shrink-0"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}
