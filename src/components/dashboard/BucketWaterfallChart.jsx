import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

// Colors
const C_INCOME  = '#10b981' // emerald-500
const C_REGULAR = '#f59e0b' // amber-400
const C_FIXED   = '#3b82f6' // blue-500
const C_SAVINGS = '#34d399' // emerald-400
const C_EMPTY   = '#e2e8f0' // slate-200

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  // The visible bar is always the second in the stack (index 1)
  const bar = payload.find(p => p.dataKey === 'value')
  if (!bar || bar.payload.isEmpty) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 px-3 py-2.5 text-sm">
      <p className="font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{label}</p>
      <p style={{ color: bar.payload.color }} className="font-bold tabular-nums">
        {bar.payload.isNegative ? '−' : ''}{formatCurrency(bar.payload.rawValue)}
      </p>
    </div>
  )
}

function yTickFormatter(v) {
  if (v === 0) return '$0'
  if (v >= 1000) return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
  return `$${v}`
}

/**
 * Props:
 *   budget     {object}  — output of calculateBudget()
 *   isAnnual   {boolean}
 *   cycleLabel {string}  — 'month' | 'fortnight'
 */
export function BucketWaterfallChart({ budget, isAnnual }) {
  const {
    netIncomePerCycle, netIncomeAnnual,
    regularBucket, regularBucketAnnual,
    fixedBucket, fixedBucketAnnual,
    actualSavings, actualSavingsAnnual,
  } = budget

  const income  = isAnnual ? netIncomeAnnual      : netIncomePerCycle
  const regular = isAnnual ? regularBucketAnnual  : regularBucket
  const fixed   = isAnnual ? fixedBucketAnnual    : fixedBucket
  const savings = isAnnual ? actualSavingsAnnual  : actualSavings

  const isEmpty = income === 0 && regular === 0 && fixed === 0
  const isOverBudget = savings < 0

  // --- Waterfall segments (capped within [0, income] for display) ---
  // Each bar: ghost (transparent offset) + value (visible segment)

  const afterRegular = income - regular
  const afterFixed   = afterRegular - fixed

  // Cap displayed values so bars never exceed income height
  const regularDisplay = Math.min(regular, income)
  const fixedDisplay   = Math.min(fixed, Math.max(0, afterRegular))
  const savingsDisplay = Math.max(0, afterFixed)

  const ghost_income  = 0
  const ghost_regular = Math.max(0, income - regularDisplay)
  const ghost_fixed   = Math.max(0, afterFixed)
  const ghost_savings = 0

  const data = isEmpty
    ? [
        { name: 'Income',  ghost: 0, value: 1, color: C_EMPTY, isEmpty: true },
        { name: 'Regular', ghost: 0, value: 1, color: C_EMPTY, isEmpty: true },
        { name: 'Fixed',   ghost: 0, value: 1, color: C_EMPTY, isEmpty: true },
        { name: 'Savings', ghost: 0, value: 1, color: C_EMPTY, isEmpty: true },
      ]
    : [
        {
          name: 'Income',
          ghost: ghost_income,
          value: income,
          color: C_INCOME,
          rawValue: income,
          isNegative: false,
        },
        {
          name: 'Regular',
          ghost: ghost_regular,
          value: regularDisplay,
          color: C_REGULAR,
          rawValue: regular,
          isNegative: true,
        },
        {
          name: 'Fixed',
          ghost: ghost_fixed,
          value: fixedDisplay,
          color: isOverBudget ? '#f43f5e' : C_FIXED,
          rawValue: fixed,
          isNegative: true,
        },
        {
          name: 'Savings',
          ghost: ghost_savings,
          value: savingsDisplay,
          color: C_SAVINGS,
          rawValue: savingsDisplay,
          isNegative: false,
        },
      ]

  const yMax = isEmpty ? 4 : income * 1.05

  return (
    <div className="flex flex-col gap-4">
      {/* Over-budget banner */}
      {isOverBudget && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2">
          <span className="text-rose-500 text-sm font-bold flex-shrink-0" aria-hidden>!</span>
          <p className="text-sm text-rose-700 dark:text-rose-400">
            Expenses exceed income by{' '}
            <span className="font-semibold">{formatCurrency(Math.abs(savings))}</span>
          </p>
        </div>
      )}

      {/* Empty state label */}
      {isEmpty && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center -mb-2">
          Complete the wizard to see your budget
        </p>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          barCategoryGap="25%"
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8' }} // slate-400
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={yTickFormatter}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            width={42}
          />
          {!isEmpty && (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(120,113,108,0.06)' }}
            />
          )}
          {/* Invisible ghost bar — creates the floating offset */}
          <Bar dataKey="ghost" stackId="wf" fill="transparent" isAnimationActive={false} />
          {/* Visible value bar */}
          <Bar
            dataKey="value"
            stackId="wf"
            radius={[5, 5, 0, 0]}
            isAnimationActive={!isEmpty}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
          {/* Connector reference line at income level */}
          {!isEmpty && (
            <ReferenceLine
              y={income}
              stroke="#d6d3d1"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      {!isEmpty && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 px-1">
          {[
            { color: C_INCOME,  label: 'Net Income',   value: income },
            { color: C_REGULAR, label: 'Regular',       value: regular },
            { color: isOverBudget ? '#f43f5e' : C_FIXED, label: 'Fixed', value: fixed },
            { color: C_SAVINGS, label: 'Savings',       value: savingsDisplay },
          ].map(({ color, label, value }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
              <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                {formatCurrency(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
