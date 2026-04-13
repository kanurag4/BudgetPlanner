import { readFileSync } from 'fs'

const pdfjsLib = await import('../node_modules/pdfjs-dist/legacy/build/pdf.mjs')

// ---- Patterns copied from payslipParser.js ----

const NET_PAY_PATTERNS = [
  /net\s+pay[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /take[- ]?home[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /net\s+income[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /total\s+net[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /net\s+amount[:\s,]+\$?([\d,]+(?:\.\d{1,2})?)/i,
  /total\s+net\s+pay[^$\d]{0,40}\$?([\d,]+(?:\.\d{1,2})?)/i,
  /\$?([\d,]+(?:\.\d{1,2})?)\s+net\s+pay\b/i,
  /\$?([\d,]+(?:\.\d{1,2})?)\s+\*?\s*employer\s+super/i,
]

const FREQ_KEYWORDS_PRIMARY = [
  { pattern: /\bfortnightly\b/i, value: 'fortnightly' },
  { pattern: /\bfortnight\b/i,   value: 'fortnightly' },
  { pattern: /\bweekly\b/i,      value: 'weekly' },
  { pattern: /\bmonthly\b/i,     value: 'monthly' },
]
const FREQ_KEYWORDS_FALLBACK = [
  { pattern: /\bannual(?:ly)?\b/i, value: 'yearly' },
  { pattern: /\byearly\b/i,        value: 'yearly' },
]

const TEXT_MONTHS = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 }

function inferFrequencyFromDateRange(text) {
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
      if (days >= 6  && days <= 8)  return 'weekly'
      if (days >= 13 && days <= 15) return 'fortnightly'
      if (days >= 28 && days <= 31) return 'monthly'
    }
  }

  const range = text.match(
    /(\d{1,2}[./]\d{1,2}[./]\d{4}|\d{4}-\d{2}-\d{2})\s*(?:-|to)\s*(\d{1,2}[./]\d{1,2}[./]\d{4}|\d{4}-\d{2}-\d{2})/i
  )
  if (!range) return null
  const parseDate = (str) => {
    if (/^\d{4}/.test(str)) { const [y,m,d] = str.split('-').map(Number); return new Date(y,m-1,d) }
    const sep = str.includes('.') ? '.' : '/'
    const [d,m,y] = str.split(sep).map(Number)
    return new Date(y,m-1,d)
  }
  const days = Math.round((parseDate(range[2]) - parseDate(range[1])) / 86400000) + 1
  if (days >= 6  && days <= 8)  return 'weekly'
  if (days >= 13 && days <= 15) return 'fortnightly'
  if (days >= 28 && days <= 31) return 'monthly'
  return null
}

// ---- Run against sample files ----

const files = [
  'C:/Personal/Employment/Payslips/sample/AUA000199__Jul05.pdf',
  'C:/Personal/Employment/Payslips/sample/Kashyap Anurag_091122 (1).pdf',
  'C:/Personal/Employment/Payslips/sample/Pay_Advice_04_01_21.pdf',
  'C:/Personal/Employment/Payslips/sample/Payslip (1).PDF',
]

for (const filePath of files) {
  const name = filePath.split('/').pop()
  try {
    const buf = readFileSync(filePath)
    const pdf = await pdfjsLib.getDocument({
      data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      useSystemFonts: true,
      disableWorker: true,
    }).promise

    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map(item => item.str).filter(s => s.trim()).join(' ') + '\n'
    }

    let netPay = null, matchedPattern = null
    for (const pat of NET_PAY_PATTERNS) {
      const m = text.match(pat)
      if (m) { netPay = parseFloat(m[1].replace(/,/g, '')); matchedPattern = pat.toString(); break }
    }

    let frequency = null, freqSource = null
    for (const { pattern, value } of FREQ_KEYWORDS_PRIMARY) {
      if (pattern.test(text)) { frequency = value; freqSource = 'keyword: ' + pattern; break }
    }
    if (!frequency) {
      frequency = inferFrequencyFromDateRange(text)
      if (frequency) freqSource = 'date-range inference'
    }
    if (!frequency) {
      for (const { pattern, value } of FREQ_KEYWORDS_FALLBACK) {
        if (pattern.test(text)) { frequency = value; freqSource = 'fallback keyword: ' + pattern; break }
      }
    }
    if (!frequency) freqSource = 'none found'

    console.log(`\n${'='.repeat(60)}`)
    console.log(`FILE     : ${name}`)
    console.log(`Net pay  : ${netPay ?? 'NULL'} ${matchedPattern ? '← ' + matchedPattern : '(no match)'}`)
    console.log(`Frequency: ${frequency ?? 'NULL'} (${freqSource})`)
    console.log(`Result   : ${netPay !== null ? '✓ HIGH confidence' : '✗ LOW confidence — will prompt user'}`)
  } catch (e) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`FILE: ${name}  -- EXTRACTION ERROR: ${e.message}`)
  }
}
