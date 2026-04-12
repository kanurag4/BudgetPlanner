export function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  color = 'emerald',
  suffix = '%',
  disabled = false,
}) {
  const trackColors = {
    emerald: 'accent-emerald-500',
    amber:   'accent-amber-400',
    blue:    'accent-blue-500',
    rose:    'accent-rose-500',
  }

  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {label}
          </label>
        )}
        <span className="text-sm font-semibold text-stone-800 dark:text-stone-100 tabular-nums">
          {value}{suffix}
        </span>
      </div>

      <div className="relative flex items-center h-6">
        {/* Filled track behind the range input */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-stone-200 dark:bg-stone-700 pointer-events-none" />
        <div
          className={`absolute h-2 rounded-full pointer-events-none ${
            color === 'emerald' ? 'bg-emerald-500' :
            color === 'amber'   ? 'bg-amber-400' :
            color === 'blue'    ? 'bg-blue-500' : 'bg-rose-500'
          }`}
          style={{ width: `${pct}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          className={[
            'relative w-full h-2 bg-transparent appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 rounded-full',
            trackColors[color] ?? trackColors.emerald,
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        />
      </div>
    </div>
  )
}
