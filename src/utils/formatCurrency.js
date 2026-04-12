const formatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '$0'
  return formatter.format(amount)
}

export function formatCurrencyDecimal(amount) {
  if (amount == null || isNaN(amount)) return '$0.00'
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
