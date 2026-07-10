import { useRef, useLayoutEffect } from 'react'

/**
 * Formatted currency input — comma-grouped display, digit-only underlying value.
 *
 * Never use type="number" for money: it blocks thousands separators, allows
 * scroll-wheel edits, and has inconsistent locale/decimal handling.
 *
 * Props:
 *   value     {string}  — raw digit string (no commas), e.g. "1500"
 *   onChange  {fn}      — called with the new raw digit string
 *   id, placeholder, disabled, className — passed through to the <input>
 */
export function MoneyInput({
  id,
  value = '',
  onChange,
  placeholder = '0',
  disabled = false,
  className = '',
  ...rest
}) {
  const inputRef = useRef(null)
  const pendingCursor = useRef(null)

  // Restore cursor position after a re-render triggered by our own onChange,
  // since the formatted display value can be longer/shorter than what was typed.
  useLayoutEffect(() => {
    if (pendingCursor.current != null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCursor.current, pendingCursor.current)
      pendingCursor.current = null
    }
  })

  function handleChange(e) {
    const el = e.target
    const pos = el.selectionStart
    const oldVal = el.value
    const digitsBeforeCursor = (oldVal.slice(0, pos).match(/\d/g) || []).length
    const raw = oldVal.replace(/\D/g, '')
    const formatted = raw ? Number(raw).toLocaleString('en-AU') : ''

    let digitCount = 0
    let newPos = formatted.length
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) digitCount++
      if (digitCount === digitsBeforeCursor) {
        newPos = i + 1
        break
      }
    }
    pendingCursor.current = newPos
    onChange(raw)
  }

  const digits = String(value).replace(/\D/g, '')
  const displayValue = digits ? Number(digits).toLocaleString('en-AU') : ''

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={e => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      {...rest}
    />
  )
}
