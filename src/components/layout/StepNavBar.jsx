import { useNavigate } from 'react-router-dom'
import { useBudget } from '../../hooks/useBudget'
import { WIZARD_STEPS, TOTAL_STEPS } from '../../utils/constants'

export function StepNavBar() {
  const navigate = useNavigate()
  const { state } = useBudget()
  const currentStep = state.wizardStep ?? 1

  const progressPct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100

  function handleStepClick(step, route) {
    if (step <= currentStep) {
      navigate(route)
    }
  }

  return (
    <nav aria-label="Wizard progress" className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">

        {/* Step dots */}
        <ol className="flex items-center justify-between relative">
          {/* Connecting line behind dots */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200 dark:bg-slate-700 mx-4" aria-hidden="true" />

          {WIZARD_STEPS.map(({ step, route, label }) => {
            const isCompleted = step < currentStep
            const isCurrent   = step === currentStep
            const isReachable = step <= currentStep

            return (
              <li key={step} className="relative flex flex-col items-center gap-1.5">
                <button
                  onClick={() => handleStepClick(step, route)}
                  disabled={!isReachable}
                  aria-label={`Step ${step}: ${label}${isCurrent ? ' (current)' : isCompleted ? ' (completed)' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                    isCompleted
                      ? 'bg-sky-500 text-white cursor-pointer hover:bg-sky-600 hover:scale-110'
                      : isCurrent
                        ? 'bg-sky-500 text-white ring-4 ring-sky-100 dark:ring-sky-900/40 scale-110'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default',
                  ].join(' ')}
                >
                  {isCompleted ? '✓' : step}
                </button>

                <span
                  className={[
                    'text-[10px] font-medium leading-tight text-center hidden sm:block',
                    isCurrent  ? 'text-sky-600 dark:text-sky-400' :
                    isCompleted ? 'text-slate-500 dark:text-slate-400' :
                                  'text-slate-400 dark:text-slate-600',
                  ].join(' ')}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
            aria-hidden="true"
          />
        </div>

      </div>
    </nav>
  )
}
