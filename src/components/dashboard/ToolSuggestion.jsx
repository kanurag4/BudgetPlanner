import { X, ArrowRight } from 'lucide-react'
import { useStorage } from '../../hooks/useStorage'
import { getRecommendation } from '../../engine/recommendations'

/**
 * Pure selector — picks which suggestion (if any) applies to the current
 * budget. Exported so the parent can key={} the component on it: useStorage
 * only reads localStorage once per mount, so if the suggestion changes
 * (e.g. severity flips from green to amber) after mount, the component
 * must remount to pick up the correct dismissal state for the new key.
 */
export function selectSuggestion(budget, profile) {
  const { savingsRate, netIncomePerCycle, actualSavings } = budget
  const { severity } = getRecommendation(profile, savingsRate)

  if (netIncomePerCycle <= 0) return null

  if (severity === 'green') {
    return {
      key: 'fire',
      title: 'Curious how soon you could stop working?',
      body: "You're hitting your savings target — the FIRE Calculator shows how many years of saving like this gets you to financial independence.",
      href: 'https://kashvector.com/fire/',
      cta: 'Try the FIRE Calculator',
    }
  }

  if (actualSavings > 0) {
    return {
      key: 'super-compare',
      title: 'Not sure where your savings should go?',
      body: 'Compare boosting super via salary sacrifice against extra mortgage repayments or ETF investing, side by side.',
      href: 'https://kashvector.com/super-compare/',
      cta: 'Try Salary Sacrifice Calculator',
    }
  }

  return null
}

/**
 * A single dismissible suggestion pointing to another KashVector tool,
 * chosen from the user's own budget numbers. Dismissal is remembered
 * per-suggestion so it won't nag again once dismissed, but a new
 * suggestion (e.g. profile changes) can still appear.
 *
 * Parent must render this with `key={suggestion?.key ?? 'none'}` — see
 * selectSuggestion's docblock for why.
 *
 * Props:
 *   suggestion {object|null} — result of selectSuggestion()
 */
export function ToolSuggestion({ suggestion }) {
  const [dismissed, setDismissed] = useStorage(
    suggestion ? `budgetplanner_dismissed_suggestion_${suggestion.key}` : 'budgetplanner_dismissed_suggestion_none',
    false
  )

  if (!suggestion || dismissed) return null

  return (
    <div className="relative rounded-2xl border border-[color-mix(in_srgb,var(--kv-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--kv-accent)_6%,transparent)] p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss suggestion"
        className="absolute top-3 right-3 p-1.5 rounded-lg text-primary hover:bg-[color-mix(in_srgb,var(--kv-accent)_15%,transparent)] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
      >
        <X size={14} />
      </button>

      <p className="text-sm font-semibold text-primary pr-8">
        {suggestion.title}
      </p>
      <p className="text-xs text-primary mt-1 pr-8 leading-relaxed">
        {suggestion.body}
      </p>
      <a
        href={suggestion.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary hover:opacity-80 transition-opacity min-h-[32px]"
      >
        {suggestion.cta}
        <ArrowRight size={12} />
      </a>
    </div>
  )
}
