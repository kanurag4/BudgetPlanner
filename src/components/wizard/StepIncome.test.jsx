import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { StepIncome } from './StepIncome'

beforeEach(() => localStorage.clear())

function setup() {
  renderWithProviders(<StepIncome />, { route: '/wizard/income' })
}

describe('StepIncome — gross toggle', () => {
  it('tax breakdown is hidden by default', () => {
    setup()
    expect(screen.queryByTestId('primary-tax-breakdown')).not.toBeInTheDocument()
  })

  it('turning on gross toggle shows the tax breakdown when an amount is entered', async () => {
    const user = userEvent.setup()
    setup()

    const grossToggle = screen.getByRole('checkbox', { name: /gross salary/i })
    await user.click(grossToggle)
    expect(grossToggle).toBeChecked()

    // Label changes to "Gross salary" after toggle — wait for re-render
    const amountInput = await screen.findByRole('spinbutton', { name: /gross salary/i })
    await user.type(amountInput, '80000')

    expect(screen.getByTestId('primary-tax-breakdown')).toBeInTheDocument()
    expect(screen.getByTestId('primary-tax-breakdown')).toHaveTextContent('Est. take-home')
  })

  it('turning gross toggle off hides the tax breakdown', async () => {
    const user = userEvent.setup()
    setup()

    const grossToggle = screen.getByRole('checkbox', { name: /gross salary/i })

    await user.click(grossToggle)
    const amountInput = await screen.findByRole('spinbutton', { name: /gross salary/i })
    await user.type(amountInput, '80000')
    expect(screen.getByTestId('primary-tax-breakdown')).toBeInTheDocument()

    await user.click(grossToggle)
    expect(screen.queryByTestId('primary-tax-breakdown')).not.toBeInTheDocument()
  })
})

describe('StepIncome — partner salary toggle', () => {
  it('partner section is hidden by default', () => {
    setup()
    expect(screen.queryByTestId('partner-section')).not.toBeInTheDocument()
  })

  it('enabling partner toggle reveals the partner section', async () => {
    const user = userEvent.setup()
    setup()

    const partnerToggle = screen.getByRole('checkbox', { name: /partner/i })
    await user.click(partnerToggle)

    expect(screen.getByTestId('partner-section')).toBeInTheDocument()
  })

  it('disabling partner toggle hides the partner section', async () => {
    const user = userEvent.setup()
    setup()

    const partnerToggle = screen.getByRole('checkbox', { name: /partner/i })
    await user.click(partnerToggle)
    expect(screen.getByTestId('partner-section')).toBeInTheDocument()

    await user.click(partnerToggle)
    expect(screen.queryByTestId('partner-section')).not.toBeInTheDocument()
  })

  it('partner section contains a salary input', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('checkbox', { name: /partner/i }))

    // There should now be two spinbuttons (primary + partner)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })
})

describe('StepIncome — Next button', () => {
  it('Next button is disabled when no salary is entered', () => {
    setup()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('Next button is enabled once a salary amount is entered', async () => {
    const user = userEvent.setup()
    setup()

    // The first spinbutton is the primary salary amount
    const [salaryInput] = screen.getAllByRole('spinbutton')
    await user.type(salaryInput, '5000')

    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })
})
