import { useState } from 'react'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'
import { getRecommendation } from '../../engine/recommendations'

function buildPdfLines(budget, state, isAnnual, cycleLabel) {
  const {
    netIncomePerCycle, netIncomeAnnual,
    primaryNetPerCycle, partnerNetPerCycle,
    regularBucket, regularBucketAnnual,
    housingPerCycle, groceriesPerCycle,
    fixedBucket, fixedBucketAnnual,
    actualSavings, actualSavingsAnnual,
    savingsRate, splitAmounts, splitAmountsAnnual,
    superPerCycle, superAnnual,
    periodsPerYear, salaryCycle,
  } = budget

  const { housing, groceries, fixedExpenses, profile, splitSliders, income } = state
  const { recommendedRate } = getRecommendation(profile, savingsRate)

  const pick = (perCycle, annual) => isAnnual ? annual : perCycle
  const freq = isAnnual ? 'year' : cycleLabel

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  const lines = []

  const h = (text) => ({ text, style: 'heading' })
  const sub = (text) => ({ text, style: 'subheading' })
  const row = (label, value) => ({ label, value, style: 'row' })
  const note = (text) => ({ text, style: 'note' })
  const spacer = () => ({ style: 'spacer' })

  lines.push(h('Budget Planner Summary'))
  lines.push(note(`Generated: ${dateStr} · Figures shown per ${freq}`))
  lines.push(spacer())

  lines.push(sub('INCOME'))
  lines.push(row('Net income', formatCurrency(pick(netIncomePerCycle, netIncomeAnnual))))
  if (primaryNetPerCycle > 0)
    lines.push(row('  Primary salary', formatCurrency(pick(primaryNetPerCycle, primaryNetPerCycle * periodsPerYear))))
  if (partnerNetPerCycle > 0)
    lines.push(row('  Partner salary', formatCurrency(pick(partnerNetPerCycle, partnerNetPerCycle * periodsPerYear))))
  lines.push(spacer())

  lines.push(sub('EXPENSES'))
  lines.push(row('Regular', formatCurrency(pick(regularBucket, regularBucketAnnual))))
  lines.push(row(`  ${housing.type === 'loan' ? 'Mortgage' : 'Rent'}`, formatCurrency(pick(housingPerCycle, housingPerCycle * periodsPerYear))))
  lines.push(row('  Groceries', formatCurrency(pick(groceriesPerCycle, groceriesPerCycle * periodsPerYear))))
  lines.push(spacer())
  lines.push(row('Fixed', formatCurrency(pick(fixedBucket, fixedBucketAnnual))))
  for (const e of fixedExpenses) {
    lines.push(row(`  ${e.name}`, `${formatCurrency(parseFloat(e.amount) || 0)} / ${e.frequency}`))
  }
  lines.push(spacer())

  lines.push(sub('SAVINGS'))
  lines.push(row('Savings', formatCurrency(pick(actualSavings, actualSavingsAnnual))))
  lines.push(row('Savings rate', `${Math.max(0, savingsRate).toFixed(1)}%`))
  lines.push(row('Recommended rate', `${recommendedRate}%`))
  lines.push(spacer())

  const splits = isAnnual ? splitAmountsAnnual : splitAmounts
  lines.push(sub('SAVINGS SPLIT'))
  lines.push(row(`Splurge (${splitSliders.splurge}%)`, formatCurrency(splits.splurge)))
  lines.push(row(`Emergency (${splitSliders.emergency}%)`, formatCurrency(splits.emergency)))
  lines.push(row(`Investment (${splitSliders.investment}%)`, formatCurrency(splits.investment)))
  lines.push(spacer())

  lines.push(sub('SUPERANNUATION'))
  lines.push(row('Employer super (12%)', formatCurrency(pick(superPerCycle, superAnnual))))
  lines.push(spacer())

  lines.push(note('This is an estimate only. Seek professional financial advice for personalised guidance.'))

  return lines
}

async function generatePdf(budget, state, isAnnual, cycleLabel) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const marginL = 20
  const marginR = 20
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const contentW = pageW - marginL - marginR

  let y = 24

  const lines = buildPdfLines(budget, state, isAnnual, cycleLabel)

  for (const line of lines) {
    if (y > pageH - 20) {
      doc.addPage()
      y = 20
    }

    if (line.style === 'spacer') {
      y += 4
      continue
    }

    if (line.style === 'heading') {
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(line.text, marginL, y)
      y += 8
      continue
    }

    if (line.style === 'subheading') {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(80, 80, 80)
      doc.text(line.text, marginL, y)
      // Underline
      doc.setDrawColor(200, 200, 200)
      doc.line(marginL, y + 1, marginL + contentW, y + 1)
      y += 7
      continue
    }

    if (line.style === 'note') {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(140, 140, 140)
      const split = doc.splitTextToSize(line.text, contentW)
      doc.text(split, marginL, y)
      y += split.length * 4.5
      continue
    }

    if (line.style === 'row') {
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      doc.text(line.label, marginL, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      const valW = doc.getTextWidth(line.value)
      doc.text(line.value, marginL + contentW - valW, y)
      y += 6
      continue
    }
  }

  const dateTag = new Date().toISOString().slice(0, 10)
  doc.save(`budget-summary-${dateTag}.pdf`)
}

/**
 * Props:
 *   budget     {object}  — output of calculateBudget()
 *   state      {object}  — full BudgetContext state
 *   isAnnual   {boolean}
 *   cycleLabel {string}
 */
export function ExportButton({ budget, state, isAnnual, cycleLabel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleExport() {
    setLoading(true)
    setError(null)
    try {
      await generatePdf(budget, state, isAnnual, cycleLabel)
    } catch (e) {
      console.error('PDF export failed', e)
      setError('Export failed — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="secondary"
        size="md"
        onClick={handleExport}
        disabled={loading || budget.netIncomePerCycle <= 0}
      >
        {loading ? 'Generating…' : 'Export PDF summary'}
      </Button>
      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}
      {budget.netIncomePerCycle <= 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Complete the wizard to enable export.
        </p>
      )}
    </div>
  )
}
