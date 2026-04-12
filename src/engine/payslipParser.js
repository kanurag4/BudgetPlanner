/**
 * payslipParser.js — client-side only. Nothing leaves the browser.
 *
 * Supported formats: PDF (pdfjs-dist), Excel (SheetJS/xlsx), CSV (papaparse)
 *
 * Returns: Promise<{ netPay: number|null, frequency: string|null, confidence: 'high'|'low', rawText: string }>
 */

// Lazy imports — only loaded when the user actually uploads a file
async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist')
  // Use the legacy build to avoid worker issues in a browser/test context
  pdfjsLib.GlobalWorkerOptions.workerSrc = ''

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
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
