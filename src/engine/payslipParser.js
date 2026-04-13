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

// Keywords to search for in extracted text (case-insensitive).
// Ordered from most specific / reliable to most permissive.
const NET_PAY_PATTERNS = [
  // Standard label-before-amount formats
  /net\s+pay[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /take[- ]?home[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /net\s+income[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /total\s+net[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /net\s+amount[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,

  // "TOTAL NET PAY - Bank Credit $4,182.75" — label then dash/text then amount
  /total\s+net\s+pay[^$\d]{0,40}\$?([\d,]+(?:\.\d{1,2})?)/i,

  // "2,519.57 Net Pay" — amount appears before the label (column-scrambled PDFs)
  /\$?([\d,]+(?:\.\d{1,2})?)\s+net\s+pay\b/i,

  // "4800.10 * Employer Superannuation" — net is the value immediately before the
  // employer super line when the PDF layout loses the "Net Income" label proximity
  /\$?([\d,]+(?:\.\d{1,2})?)\s+\*?\s*employer\s+super/i,
]

// High-confidence frequency keywords — unambiguous pay cycle terms
const FREQ_KEYWORDS_PRIMARY = [
  { pattern: /\bfortnightly\b/i, value: 'fortnightly' },
  { pattern: /\bfortnight\b/i,   value: 'fortnightly' },
  { pattern: /\bweekly\b/i,      value: 'weekly' },
  { pattern: /\bmonthly\b/i,     value: 'monthly' },
]

// Low-confidence — "annual/yearly" often appears in allowance and salary
// descriptions unrelated to pay cycle, so only use as a last resort
const FREQ_KEYWORDS_FALLBACK = [
  { pattern: /\bannual(?:ly)?\b/i, value: 'yearly' },
  { pattern: /\byearly\b/i,        value: 'yearly' },
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
  // 1. Unambiguous keywords (fortnightly / weekly / monthly)
  for (const { pattern, value } of FREQ_KEYWORDS_PRIMARY) {
    if (pattern.test(text)) return value
  }
  // 2. Date-range inference — more reliable than "annual" keyword
  const inferred = inferFrequencyFromDateRange(text)
  if (inferred) return inferred
  // 3. annual/yearly as last resort
  for (const { pattern, value } of FREQ_KEYWORDS_FALLBACK) {
    if (pattern.test(text)) return value
  }
  return null
}

const TEXT_MONTHS = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 }

/**
 * Infer pay frequency from a pay period date range when no keyword is present.
 * Handles formats:
 *   - dd.mm.yyyy / dd/mm/yyyy / yyyy-mm-dd  (numeric)
 *   - "29 Jun 20 - 05 Jul 20" / "1 January 2021 to 31 January 2021"  (text month)
 */
function inferFrequencyFromDateRange(text) {
  // Text-month format: "29 Jun 20 - 05 Jul 20" or "1 January 2021 to 31 January 2021"
  const textRange = text.match(
    /(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})\s*(?:-{1,2}|to)\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})/i
  )
  if (textRange) {
    const parseTextDate = (str) => {
      const m = str.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})/)
      if (!m) return null
      const mon = TEXT_MONTHS[m[2].toLowerCase().substring(0, 3)]
      if (mon === undefined) return null
      const year = m[3].length === 2 ? 2000 + parseInt(m[3]) : parseInt(m[3])
      return new Date(year, mon, parseInt(m[1]))
    }
    const s = parseTextDate(textRange[1])
    const e = parseTextDate(textRange[2])
    if (s && e) {
      const days = Math.round((e - s) / 86400000) + 1
      if (days >= 6 && days <= 8)   return 'weekly'
      if (days >= 13 && days <= 15) return 'fortnightly'
      if (days >= 28 && days <= 31) return 'monthly'
    }
  }

  // Numeric format: dd.mm.yyyy, dd/mm/yyyy, yyyy-mm-dd
  const range = text.match(
    /(\d{1,2}[./]\d{1,2}[./]\d{4}|\d{4}-\d{2}-\d{2})\s*(?:-|to)\s*(\d{1,2}[./]\d{1,2}[./]\d{4}|\d{4}-\d{2}-\d{2})/i
  )
  if (!range) return null

  const parseDate = (str) => {
    if (/^\d{4}/.test(str)) {
      const [y, m, d] = str.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
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
