const VARIANTS = {
  green: {
    wrapper: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
    icon:    'text-emerald-500',
    title:   'text-emerald-800 dark:text-emerald-300',
    body:    'text-emerald-700 dark:text-emerald-400',
  },
  amber: {
    wrapper: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    icon:    'text-amber-500',
    title:   'text-amber-800 dark:text-amber-300',
    body:    'text-amber-700 dark:text-amber-400',
  },
  red: {
    wrapper: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800',
    icon:    'text-rose-500',
    title:   'text-rose-800 dark:text-rose-300',
    body:    'text-rose-700 dark:text-rose-400',
  },
  blue: {
    wrapper: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    icon:    'text-blue-500',
    title:   'text-blue-800 dark:text-blue-300',
    body:    'text-blue-700 dark:text-blue-400',
  },
}

const ICONS = {
  green: '✓',
  amber: '!',
  red:   '✕',
  blue:  'i',
}

export function AlertBanner({ variant = 'green', title, children, className = '' }) {
  const styles = VARIANTS[variant] ?? VARIANTS.green

  return (
    <div
      className={[
        'flex gap-3 rounded-xl border px-4 py-3',
        styles.wrapper,
        className,
      ].join(' ')}
      role="alert"
    >
      <span
        className={[
          'flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
          styles.icon,
        ].join(' ')}
        aria-hidden="true"
      >
        {ICONS[variant]}
      </span>

      <div className="min-w-0">
        {title && (
          <p className={`text-sm font-semibold ${styles.title}`}>{title}</p>
        )}
        {children && (
          <p className={`text-sm mt-0.5 ${styles.body}`}>{children}</p>
        )}
      </div>
    </div>
  )
}
