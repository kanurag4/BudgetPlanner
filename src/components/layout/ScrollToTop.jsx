import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * HashRouter doesn't reset scroll position between routes. Without this,
 * clicking Next at the bottom of a long wizard step lands the user mid-page
 * on the next step instead of at its top.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
