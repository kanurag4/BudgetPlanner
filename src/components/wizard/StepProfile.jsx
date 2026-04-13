import { useNavigate } from 'react-router-dom'
import { useBudget } from '../../hooks/useBudget'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { InfoTooltip } from '../ui/Tooltip'
import { AGE_GROUPS, FAMILY_SITUATIONS } from '../../utils/constants'

export function StepProfile() {
  const navigate = useNavigate()
  const { state, actions } = useBudget()
  const { profile } = state
  const { familySituation, numberOfKids, ageGroup } = profile

  function handleFinish() {
    actions.setWizardStep(7) // marks wizard complete
    navigate('/dashboard')
  }

  function handleBack() {
    navigate('/wizard/savings')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Tell us a bit about yourself
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Used to recommend a personalised savings rate — nothing else.
        </p>
      </div>

      {/* Family situation */}
      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">Family situation</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {FAMILY_SITUATIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  actions.updateProfile({ familySituation: value })
                  if (value !== 'couple+kids') actions.updateProfile({ numberOfKids: 0 })
                }}
                className={[
                  'py-3 px-4 rounded-xl border text-sm font-medium min-h-[44px] text-left transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-400',
                  familySituation === value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-300',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Number of kids */}
          {familySituation === 'couple+kids' && (
            <div className="flex flex-col gap-2 pt-1 border-t border-stone-100 dark:border-stone-700">
              <label
                htmlFor="num-kids"
                className="text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Number of kids
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => actions.updateProfile({ numberOfKids: n })}
                    className={[
                      'w-12 h-12 rounded-xl border text-sm font-bold transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-emerald-400',
                      numberOfKids === n
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-300',
                    ].join(' ')}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => actions.updateProfile({ numberOfKids: 5 })}
                  className={[
                    'px-3 h-12 rounded-xl border text-sm font-medium transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-emerald-400',
                    numberOfKids >= 5
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-300',
                  ].join(' ')}
                >
                  5+
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Age group */}
      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">Your age group</h3>
            <InfoTooltip content="Used to set your recommended savings rate based on your life stage." />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {AGE_GROUPS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => actions.updateProfile({ ageGroup: value })}
                className={[
                  'py-3 px-2 rounded-xl border text-sm font-medium min-h-[44px] transition-all text-center',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-400',
                  ageGroup === value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-300',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
        Almost there! Hit the button below to see your personalised budget.
      </div>

      <div className="flex flex-col gap-2 pb-safe">
        <Button fullWidth size="lg" onClick={handleFinish}>
          See my budget →
        </Button>
        <Button fullWidth size="md" variant="ghost" onClick={handleBack}>
          ← Back
        </Button>
      </div>
    </div>
  )
}
