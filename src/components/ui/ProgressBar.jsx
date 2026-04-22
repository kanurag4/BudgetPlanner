export function ProgressBar({ value, max = 100, label, showLabel = false, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
