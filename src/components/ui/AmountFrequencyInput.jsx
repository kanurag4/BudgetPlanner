import { normaliseToFrequency } from '../../engine/normalise'
import { formatCurrency } from '../../utils/formatCurrency'
import { FREQUENCIES } from '../../utils/constants'

/**
 * Reusable amount + frequency input with a live per-cycle preview.
 *
 * Props:
 *   amount       {string|number}  — controlled amount value
 *   frequency    {string}         — controlled frequency key
 *   onChange     {fn}             — called with { amount, frequency }
 *   frequencies  {string[]}       — allowed frequency options
 *   salaryCycle  {string}         — 'monthly'|'fortnightly' for the preview
 *   label        {string}         — optional field label
 *   placeholder  {string}
 *   disabled     {boolean}
 *   id           {string}         — base id for inputs
 */
export function AmountFrequencyInput({
  amount = '',
  frequency = 'monthly',
  onChange,
  frequencies = ['yearly', 'quarterly', 'monthly', 'fortnightly'],
  salaryCycle = 'monthly',
  label,
  placeholder = '0',
  disabled = false,
  id = 'amount-freq',
}) {
  const cycleLabel = salaryCycle === 'fortnightly' ? 'fortnight' : 'month'

  const numericAmount = parseFloat(String(amount).replace(/,/g, '')) || 0

  const previewAmount =
    numericAmount > 0 && frequency !== salaryCycle
      ? normaliseToFrequency(numericAmount, frequency, salaryCycle)
      : null

  function handleAmountChange(e) {
    onChange({ amount: e.target.value, frequency })
  }

  function handleFrequencyChange(e) {
    onChange({ amount, frequency: e.target.value })
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={`${id}-amount`}
          className="text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          {label}
        </label>
      )}

      <div className="flex gap-2">
        {/* Amount */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium pointer-events-none">
            $
          </span>
          <input
            id={`${id}-amount`}
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={handleAmountChange}
            placeholder={placeholder}
            disabled={disabled}
            className={[
              'w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm',
              'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600',
              'text-stone-800 dark:text-stone-100 placeholder-stone-400',
              'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent',
              'min-h-[44px]',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          />
        </div>

        {/* Frequency */}
        <select
          id={`${id}-frequency`}
          value={frequency}
          onChange={handleFrequencyChange}
          disabled={disabled}
          aria-label="Frequency"
          className={[
            'px-3 py-2.5 rounded-xl border text-sm font-medium',
            'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600',
            'text-stone-800 dark:text-stone-100',
            'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent',
            'min-h-[44px] min-w-[130px]',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {frequencies.map(f => (
            <option key={f} value={f}>
              {FREQUENCIES[f]?.label ?? f}
            </option>
          ))}
        </select>
      </div>

      {/* Live preview */}
      <div className="min-h-[20px]">
        {previewAmount !== null && (
          <p
            className="text-xs text-stone-500 dark:text-stone-400"
            data-testid="amount-preview"
          >
            ≈ {formatCurrency(previewAmount)} per {cycleLabel}
          </p>
        )}
      </div>
    </div>
  )
}
