import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

const BUCKET_COLORS = {
  Regular: '#f59e0b',  // amber-400
  Fixed:   '#3b82f6',  // blue-500
  Savings: '#10b981',  // emerald-500
}

const EMPTY_COLOR = '#e7e5e4' // stone-200

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  if (name === 'Empty') return null
  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md border border-stone-100 dark:border-stone-700 px-3 py-2 text-sm">
      <p className="font-semibold text-stone-800 dark:text-stone-100">{name}</p>
      <p className="text-stone-500 dark:text-stone-400">{formatCurrency(value)}</p>
    </div>
  )
}

const LEGEND_ITEMS = [
  { key: 'Regular', label: 'Regular',  color: BUCKET_COLORS.Regular },
  { key: 'Fixed',   label: 'Fixed',    color: BUCKET_COLORS.Fixed },
  { key: 'Savings', label: 'Savings',  color: BUCKET_COLORS.Savings },
]

/**
 * Props:
 *   budget     {object}  — output of calculateBudget()
 *   isAnnual   {boolean}
 *   cycleLabel {string}  — 'month' | 'fortnight'
 */
export function BucketDonutChart({ budget, isAnnual, cycleLabel }) {
  const {
    regularBucket, regularBucketAnnual,
    fixedBucket,   fixedBucketAnnual,
    actualSavings, actualSavingsAnnual,
    netIncomePerCycle, netIncomeAnnual,
  } = budget

  const regular = isAnnual ? regularBucketAnnual : regularBucket
  const fixed   = isAnnual ? fixedBucketAnnual   : fixedBucket
  const savings = Math.max(0, isAnnual ? actualSavingsAnnual : actualSavings)
  const income  = isAnnual ? netIncomeAnnual      : netIncomePerCycle

  const hasData = regular + fixed + savings > 0

  const chartData = hasData
    ? [
        { name: 'Regular', value: regular },
        { name: 'Fixed',   value: fixed },
        { name: 'Savings', value: savings },
      ].filter(d => d.value > 0)
    : [{ name: 'Empty', value: 1 }]

  const isOverBudget = actualSavings < 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut */}
      <div className="relative flex-shrink-0">
        <PieChart width={200} height={200}>
          <Pie
            data={chartData}
            cx={100}
            cy={100}
            innerRadius={62}
            outerRadius={92}
            dataKey="value"
            strokeWidth={2}
            stroke="transparent"
            paddingAngle={hasData ? 2 : 0}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.name === 'Empty' ? EMPTY_COLOR : BUCKET_COLORS[entry.name]}
              />
            ))}
          </Pie>
          {hasData && <Tooltip content={<CustomTooltip />} />}
        </PieChart>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hasData ? (
            <>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wide">
                {isAnnual ? 'yearly' : `per ${cycleLabel}`}
              </p>
              <p className="text-lg font-bold text-stone-800 dark:text-stone-100 tabular-nums leading-tight">
                {formatCurrency(income)}
              </p>
            </>
          ) : (
            <p className="text-xs text-stone-400 dark:text-stone-500 text-center px-4 leading-snug">
              Complete the wizard to see your budget
            </p>
          )}
        </div>
      </div>

      {/* Legend + over-budget warning */}
      <div className="flex flex-col gap-3 flex-1 w-full sm:w-auto">
        {isOverBudget && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2">
            <span className="text-rose-500 text-sm font-bold flex-shrink-0">!</span>
            <p className="text-sm text-rose-700 dark:text-rose-400">
              Expenses exceed income by {formatCurrency(Math.abs(isAnnual ? actualSavingsAnnual : actualSavings))}
            </p>
          </div>
        )}

        {LEGEND_ITEMS.map(({ key, label, color }) => {
          const value = chartData.find(d => d.name === key)?.value ?? 0
          return (
            <div key={key} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-stone-600 dark:text-stone-400 flex-1">{label}</span>
              <span className="text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100">
                {formatCurrency(value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
