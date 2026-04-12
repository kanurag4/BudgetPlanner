import { useBudget } from '../../hooks/useBudget'

const OPTIONS = [
  { value: 'cycle',  label: 'Per Cycle' },
  { value: 'annual', label: 'Annual' },
]

export function ViewToggle() {
  const { state, actions } = useBudget()
  const { dashboardView } = state

  return (
    <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 gap-1">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => actions.setDashboardView(value)}
          className={[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px]',
            dashboardView === value
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
