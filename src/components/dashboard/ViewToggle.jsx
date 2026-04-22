import { useBudget } from '../../hooks/useBudget'

const OPTIONS = [
  { value: 'cycle',  label: 'Per Cycle' },
  { value: 'annual', label: 'Annual' },
]

export function ViewToggle() {
  const { state, actions } = useBudget()
  const { dashboardView } = state

  return (
    <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => actions.setDashboardView(value)}
          className={[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px]',
            dashboardView === value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
