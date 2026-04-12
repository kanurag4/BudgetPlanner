import { useState, useEffect, useRef } from 'react'

/**
 * localStorage abstraction — the single swap point for Capacitor.
 * To go mobile: replace the body with @capacitor/preferences calls.
 * No component changes needed.
 *
 * Returns [value, setValue, clearValue]
 */
export function useStorage(key, defaultValue) {
  const skipNextWrite = useRef(false)

  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return defaultValue
      return JSON.parse(stored)
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    if (skipNextWrite.current) {
      skipNextWrite.current = false
      return
    }
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage quota exceeded or private mode — fail silently
    }
  }, [key, value])

  function clearValue() {
    skipNextWrite.current = true
    localStorage.removeItem(key)
    setValue(defaultValue)
  }

  return [value, setValue, clearValue]
}
