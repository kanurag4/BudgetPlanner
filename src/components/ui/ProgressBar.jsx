export function ProgressBar({ value, max = 100, label, showLabel = false, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-stone-500 dark:text-stone-400">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
