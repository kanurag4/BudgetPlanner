export function Toggle({ checked, onChange, label, description, id, disabled = false }) {
  const toggleId = id ?? `toggle-${label?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <label
      htmlFor={toggleId}
      className={[
        'flex items-start gap-3 cursor-pointer select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {/* Track */}
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={e => !disabled && onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={[
            'w-11 h-6 rounded-full transition-colors duration-200',
            checked ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600',
          ].join(' ')}
        />
        <div
          className={[
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </div>

      {/* Label */}
      {(label || description) && (
        <div className="min-h-[44px] flex flex-col justify-center">
          {label && (
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  )
}
