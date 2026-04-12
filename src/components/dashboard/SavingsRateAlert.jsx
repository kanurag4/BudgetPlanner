import { Card } from '../ui/Card'
import { getRecommendation } from '../../engine/recommendations'

const SEVERITY_STYLES = {
  green: {
    bar:    'bg-emerald-500',
    text:   'text-emerald-700 dark:text-emerald-400',
    badge:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    bg:     'bg-emerald-50 dark:bg-emerald-900/10',
    icon:   '✓',
  },
  amber: {
    bar:    'bg-amber-400',
    text:   'text-amber-700 dark:text-amber-400',
    badge:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    bg:     'bg-amber-50 dark:bg-amber-900/10',
    icon:   '~',
  },
  red: {
    bar:    'bg-rose-500',
    text:   'text-rose-700 dark:text-rose-400',
    badge:  'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    bg:     'bg-rose-50 dark:bg-rose-900/10',
    icon:   '!',
  },
}

const SEVERITY_MESSAGES = {
  green: 'Great work — you\'re meeting or exceeding your recommended savings rate.',
  amber: 'Close — a small increase to your savings rate would hit your target.',
  red:   'Your savings rate is below the recommended level for your profile.',
}

/**
 * Props:
 *   budget  {object} — output of calculateBudget()
 *   profile {object} — state.profile { ageGroup, familySituation, numberOfKids }
 */
export function SavingsRateAlert({ budget, profile }) {
  const { savingsRate, netIncomePerCycle } = budget

  // Don't render if there's no income data yet
  if (netIncomePerCycle <= 0) return null

  const { recommendedRate, severity, shortfallNote } = getRecommendation(profile, savingsRate)
  const styles = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.amber

  const actualClamped   = Math.max(0, Math.min(100, savingsRate))
  const recommendedMark = Math.min(100, recommendedRate) // position of the target marker

  return (
    <Card className={`border ${styles.border} ${styles.bg}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            Savings rate
          </p>
          <p className={`text-xs mt-0.5 ${styles.text}`}>
            {SEVERITY_MESSAGES[severity]}
          </p>
        </div>

        {/* Icon badge */}
        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${styles.badge}`}>
          {styles.icon}
        </span>
      </div>

      {/* Progress bar with target marker */}
      <div className="relative h-3 bg-stone-200 dark:bg-stone-700 rounded-full overflow-visible mb-4">
        {/* Actual rate fill */}
        <div
          className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
          style={{ width: `${actualClamped}%` }}
        />
        {/* Target marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-stone-500 dark:bg-stone-400 rounded-full"
          style={{ left: `${recommendedMark}%` }}
          title={`Target: ${recommendedRate}%`}
        />
      </div>

      {/* Numbers */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${styles.bar}`} />
          <span className="text-stone-500 dark:text-stone-400">Your rate</span>
          <span className={`font-bold tabular-nums ${styles.text}`}>
            {Math.max(0, savingsRate).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-0.5 h-3 bg-stone-500 dark:bg-stone-400 rounded-full" />
          <span className="text-stone-500 dark:text-stone-400">Target</span>
          <span className="font-bold tabular-nums text-stone-600 dark:text-stone-300">
            {recommendedRate}%
          </span>
        </div>
      </div>

      {shortfallNote && (
        <p className={`text-xs mt-2 font-medium ${styles.text}`}>
          {shortfallNote}
        </p>
      )}
    </Card>
  )
}
