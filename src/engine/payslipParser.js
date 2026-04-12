/**
 * payslipParser.js — client-side only. Nothing leaves the browser.
 *
 * Supported formats: PDF (pdfjs-dist), Excel (SheetJS/xlsx), CSV (papaparse)
 *
 * Returns: Promise<{ netPay: number|null, frequency: string|null, confidence: 'high'|'low', rawText: string }>
 */

// Pre-resolve the worker URL at build time so Vite includes it in the bundle.
// The ?url suffix returns only the asset path — no worker code runs on import.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Lazy imports — only loaded when the user actually uploads a file
async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).filter(s => s.trim()).join(' ') + '\n'
  }
  return text
}

async function extractTextFromExcel(file) {
  const XLSX = await import('xlsx')
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  let text = ''
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    text += XLSX.utils.sheet_to_csv(sheet) + '\n'
  }
  return text
}

async function extractTextFromCSV(file) {
  const Papa = await import('papaparse')
  return new Promise((resolve) => {
    Papa.default.parse(file, {
      complete: (results) => {
        const text = results.data.map(row => row.join(',')).join('\n')
        resolve(text)
      },
      error: () => resolve(''),
    })
  })
}

// Keywords to search for in extracted text (case-insensitive)
const NET_PAY_PATTERNS = [
  /net\s+pay[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /take[- ]?home[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /net\s+income[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /total\s+net[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /net\s+amount[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
]

const FREQUENCY_PATTERNS = [
  { pattern: /\bfortnightly\b/i, value: 'fortnightly' },
  { pattern: /\bfortnight\b/i, value: 'fortnightly' },
  { pattern: /\bweekly\b/i, value: 'weekly' },
  { pattern: /\bmonthly\b/i, value: 'monthly' },
  { pattern: /\bannual(?:ly)?\b/i, value: 'yearly' },
  { pattern: /\byearly\b/i, value: 'yearly' },
]

function extractNetPay(text) {
  for (const pattern of NET_PAY_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(value) && value > 0) return value
    }
  }
  return null
}

function extractFrequency(text) {
  for (const { pattern, value } of FREQUENCY_PATTERNS) {
    if (pattern.test(text)) return value
  }
  return inferFrequencyFromDateRange(text)
}

/**
 * Infer pay frequency from a pay period date range when no keyword is present.
 * Handles formats like "11.10.2025 - 24.10.2025", "2025-10-11 to 2025-10-24",
 * "01/10/2025 - 14/10/2025" etc.
 */
function inferFrequencyFromDateRange(text) {
  // Match two dates separated by - or to/TO, in dd.mm.yyyy, dd/mm/yyyy, or yyyy-mm-dd
  const range = text.match(
    /(\d{1,2}[./]\d{1,2}[./]\d{4}|\d{4}-\d{2}-\d{2})\s*(?:-|to)\s*(\d{1,2}[./]\d{1,2}[./]\d{4}|\d{4}-\d{2}-\d{2})/i
  )
  if (!range) return null

  const parseDate = (str) => {
    // yyyy-mm-dd
    if (/^\d{4}/.test(str)) {
      const [y, m, d] = str.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    // dd.mm.yyyy or dd/mm/yyyy
    const sep = str.includes('.') ? '.' : '/'
    const [d, m, y] = str.split(sep).map(Number)
    return new Date(y, m - 1, d)
  }

  const start = parseDate(range[1])
  const end = parseDate(range[2])
  const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1

  if (days >= 6 && days <= 8)   return 'weekly'
  if (days >= 13 && days <= 15) return 'fortnightly'
  if (days >= 28 && days <= 31) return 'monthly'
  return null
}

/**
 * Parse a payslip file and extract net pay + frequency.
 *
 * @param {File} file
 * @returns {Promise<{ netPay: number|null, frequency: string|null, confidence: 'high'|'low', rawText: string }>}
 */
export async function parsePayslip(file) {
  let rawText = ''

  try {
    const name = file.name?.toLowerCase() ?? ''

    if (name.endsWith('.pdf')) {
      rawText = await extractTextFromPDF(file)
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      rawText = await extractTextFromExcel(file)
    } else if (name.endsWith('.csv')) {
      rawText = await extractTextFromCSV(file)
    } else {
      // Try reading as plain text
      rawText = await file.text()
    }
  } catch {
    rawText = ''
  }

  const netPay = extractNetPay(rawText)
  const frequency = extractFrequency(rawText)
  const confidence = netPay !== null ? 'high' : 'low'

  return { netPay, frequency, confidence, rawText }
}
