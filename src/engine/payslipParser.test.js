import { describe, it, expect, vi } from 'vitest'
import { parsePayslip } from './payslipParser'

// Helper: create a mock File with given text content and filename
function mockTextFile(content, filename = 'payslip.txt') {
  return {
    name: filename,
    text: async () => content,
    arrayBuffer: async () => new TextEncoder().encode(content).buffer,
  }
}

// For CSV tests, papaparse parses the File object directly via its streaming API.
// We mock it to avoid the browser File API.
vi.mock('papaparse', () => ({
  default: {
    parse: (file, options) => {
      // Simulate synchronous parse of CSV content
      file.text().then(text => {
        const rows = text.split('\n').map(line => line.split(','))
        options.complete({ data: rows })
      })
    },
  },
}))

describe('parsePayslip — net pay extraction from plain text', () => {
  it('extracts net pay from "Net Pay $4,200"', async () => {
    const file = mockTextFile('Gross Pay $6,000\nNet Pay $4,200\nFortnightly')
    const result = await parsePayslip(file)
    expect(result.netPay).toBe(4200)
    expect(result.confidence).toBe('high')
  })

  it('extracts net pay from "Take Home: 3500"', async () => {
    const file = mockTextFile('Take Home: 3500\nMonthly')
    const result = await parsePayslip(file)
    expect(result.netPay).toBe(3500)
    expect(result.confidence).toBe('high')
  })

  it('extracts net pay from "NET INCOME: $2,800.50"', async () => {
    const file = mockTextFile('NET INCOME: $2,800.50')
    const result = await parsePayslip(file)
    expect(result.netPay).toBeCloseTo(2800.5)
    expect(result.confidence).toBe('high')
  })

  it('extracts net pay from "Total Net $5100"', async () => {
    const file = mockTextFile('Total Net $5100')
    const result = await parsePayslip(file)
    expect(result.netPay).toBe(5100)
    expect(result.confidence).toBe('high')
  })

  it('returns null netPay with low confidence when no keyword found', async () => {
    const file = mockTextFile('Employee Name: John Smith\nDepartment: Engineering')
    const result = await parsePayslip(file)
    expect(result.netPay).toBeNull()
    expect(result.confidence).toBe('low')
  })
})

describe('parsePayslip — frequency extraction', () => {
  it('detects FORTNIGHTLY', async () => {
    const file = mockTextFile('Net Pay $3,000\nFORTNIGHTLY pay period')
    const result = await parsePayslip(file)
    expect(result.frequency).toBe('fortnightly')
  })

  it('detects monthly', async () => {
    const file = mockTextFile('Net Pay $5,000\nMonthly salary')
    const result = await parsePayslip(file)
    expect(result.frequency).toBe('monthly')
  })

  it('detects annual', async () => {
    const file = mockTextFile('Net income $60,000\nAnnual salary statement')
    const result = await parsePayslip(file)
    expect(result.frequency).toBe('yearly')
  })

  it('returns null frequency when no frequency keyword found', async () => {
    const file = mockTextFile('Net Pay $3,000')
    const result = await parsePayslip(file)
    expect(result.frequency).toBeNull()
  })
})

describe('parsePayslip — CSV format', () => {
  it('extracts net pay from CSV row "net pay,3500"', async () => {
    const file = mockTextFile('description,amount\nnet pay,3500\ngross pay,5000', 'payslip.csv')
    const result = await parsePayslip(file)
    expect(result.netPay).toBe(3500)
    expect(result.confidence).toBe('high')
  })
})

describe('parsePayslip — rawText', () => {
  it('returns raw extracted text', async () => {
    const content = 'Net Pay $2,500\nMonthly'
    const file = mockTextFile(content)
    const result = await parsePayslip(file)
    expect(result.rawText).toBe(content)
  })
})
