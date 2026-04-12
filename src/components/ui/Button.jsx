const VARIANTS = {
  primary:   'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow',
  secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 dark:text-stone-100',
  ghost:     'bg-transparent hover:bg-stone-100 text-stone-700 dark:hover:bg-stone-800 dark:text-stone-300',
  danger:    'bg-rose-500 hover:bg-rose-600 text-white shadow-sm',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm min-h-[44px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-stone-900',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
