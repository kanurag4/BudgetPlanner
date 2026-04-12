import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { SavingsSplitSliders } from './SavingsSplitSliders'

beforeEach(() => localStorage.clear())

function setup() {
  renderWithProviders(<SavingsSplitSliders savingsPerCycle={1000} cycleLabel="month" />)
}

describe('SavingsSplitSliders — initial render', () => {
  it('renders three sliders', () => {
    setup()
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(3)
  })

  it('shows default values 20 / 40 / 40', () => {
    setup()
    const sliders = screen.getAllByRole('slider')
    expect(sliders[0]).toHaveValue('20')
    expect(sliders[1]).toHaveValue('40')
    expect(sliders[2]).toHaveValue('40')
  })

  it('initial total is 100%', () => {
    setup()
    expect(screen.getByText('Total: 100%')).toBeInTheDocument()
  })
})

describe('SavingsSplitSliders — redistribution', () => {
  it('total always stays at 100 after moving a slider', async () => {
    const user = userEvent.setup()
    setup()

    const [splurge] = screen.getAllByRole('slider')

    // Simulate changing splurge from 20 → 50
    await user.pointer([
      { target: splurge },
    ])
    // Use fireEvent for range input changes since userEvent doesn't natively support them
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(splurge, { target: { value: '50' } })

    expect(screen.getByText('Total: 100%')).toBeInTheDocument()
  })

  it('moving splurge to 60 redistributes emergency and investment proportionally', async () => {
    const { fireEvent } = await import('@testing-library/react')
    setup()

    const [splurge, emergency, investment] = screen.getAllByRole('slider')

    fireEvent.change(splurge, { target: { value: '60' } })

    // emergency was 40, investment was 40 — equal, so both get 20
    const eVal = parseInt(emergency.value)
    const iVal = parseInt(investment.value)
    expect(eVal + iVal).toBe(40)   // remaining after 60
    expect(eVal).toBe(iVal)        // proportionally equal (both were 40)
    expect(parseInt(splurge.value) + eVal + iVal).toBe(100)
  })

  it('moving emergency to 0 shifts its share to the others', async () => {
    const { fireEvent } = await import('@testing-library/react')
    setup()

    const [splurge, emergency, investment] = screen.getAllByRole('slider')

    fireEvent.change(emergency, { target: { value: '0' } })

    const sVal = parseInt(splurge.value)
    const iVal = parseInt(investment.value)
    expect(sVal + iVal).toBe(100)
    expect(screen.getByText('Total: 100%')).toBeInTheDocument()
  })

  it('moving investment to 100 collapses the other two to 0', async () => {
    const { fireEvent } = await import('@testing-library/react')
    setup()

    const [splurge, emergency, investment] = screen.getAllByRole('slider')

    fireEvent.change(investment, { target: { value: '100' } })

    expect(parseInt(splurge.value) + parseInt(emergency.value) + parseInt(investment.value)).toBe(100)
    expect(screen.getByText('Total: 100%')).toBeInTheDocument()
  })
})
