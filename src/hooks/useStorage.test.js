import { renderHook, act } from '@testing-library/react'
import { useStorage } from './useStorage'

const KEY = 'test_key'

beforeEach(() => {
  localStorage.clear()
})

describe('useStorage', () => {
  it('returns default value when nothing is stored', () => {
    const { result } = renderHook(() => useStorage(KEY, 42))
    expect(result.current[0]).toBe(42)
  })

  it('returns default object when nothing is stored', () => {
    const def = { a: 1, b: 'hello' }
    const { result } = renderHook(() => useStorage(KEY, def))
    expect(result.current[0]).toEqual(def)
  })

  it('reads an existing stored value on mount', () => {
    localStorage.setItem(KEY, JSON.stringify({ score: 99 }))
    const { result } = renderHook(() => useStorage(KEY, {}))
    expect(result.current[0]).toEqual({ score: 99 })
  })

  it('writes the value to localStorage when setValue is called', () => {
    const { result } = renderHook(() => useStorage(KEY, 0))
    act(() => {
      result.current[1](7)
    })
    expect(result.current[0]).toBe(7)
    expect(JSON.parse(localStorage.getItem(KEY))).toBe(7)
  })

  it('clear() removes the key and resets to default', () => {
    const { result } = renderHook(() => useStorage(KEY, 'default'))
    act(() => {
      result.current[1]('changed')
    })
    expect(result.current[0]).toBe('changed')

    act(() => {
      result.current[2]() // clearValue
    })
    expect(result.current[0]).toBe('default')
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('returns default when stored JSON is invalid', () => {
    localStorage.setItem(KEY, 'not valid json {{{{')
    const { result } = renderHook(() => useStorage(KEY, 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('persists updated value across re-renders', () => {
    const { result, rerender } = renderHook(() => useStorage(KEY, 0))
    act(() => {
      result.current[1](55)
    })
    rerender()
    expect(result.current[0]).toBe(55)
  })
})
