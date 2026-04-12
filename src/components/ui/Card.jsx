export function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={[
        'bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700',
        padding ? 'p-5 sm:p-6' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
