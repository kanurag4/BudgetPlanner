import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { AmountFrequencyInput } from './AmountFrequencyInput'

// Stateless setup — for rendering / preview tests (static props)
function setup(props = {}) {
  const onChange = props.onChange ?? vi.fn()
  const defaultProps = {
    amount: '',
    frequency: 'monthly',
    salaryCycle: 'monthly',
    onChange,
    ...props,
  }
  render(<AmountFrequencyInput {...defaultProps} />)
  return { onChange }
}

// Stateful setup — for interaction tests where the input must update between keystrokes
function setupControlled(initialProps = {}) {
  const onChangeSpy = vi.fn()

  function Wrapper() {
    const [state, setState] = useState({
      amount: initialProps.amount ?? '',
      frequency: initialProps.frequency ?? 'monthly',
    })
    return (
      <AmountFrequencyInput
        salaryCycle="monthly"
        {...initialProps}
        amount={state.amount}
        frequency={state.frequency}
        onChange={(val) => { setState(val); onChangeSpy(val) }}
      />
    )
  }

  render(<Wrapper />)
  return { onChange: onChangeSpy }
}

describe('AmountFrequencyInput — rendering', () => {
  it('renders amount input and frequency select', () => {
    setup()
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    setup({ label: 'Monthly rent' })
    expect(screen.getByText('Monthly rent')).toBeInTheDocument()
  })

  it('does not show preview when amount is empty', () => {
    setup({ amount: '' })
    expect(screen.queryByTestId('amount-preview')).not.toBeInTheDocument()
  })

  it('does not show preview when frequency equals salaryCycle', () => {
    setup({ amount: '1000', frequency: 'monthly', salaryCycle: 'monthly' })
    expect(screen.queryByTestId('amount-preview')).not.toBeInTheDocument()
  })
})

describe('AmountFrequencyInput — live preview', () => {
  it('shows preview when frequency differs from salaryCycle', () => {
    setup({ amount: '12000', frequency: 'yearly', salaryCycle: 'monthly' })
    expect(screen.getByTestId('amount-preview')).toBeInTheDocument()
    expect(screen.getByTestId('amount-preview')).toHaveTextContent('$1,000')
  })

  it('normalises yearly amount to fortnightly cycle', () => {
    setup({ amount: '26000', frequency: 'yearly', salaryCycle: 'fortnightly' })
    const preview = screen.getByTestId('amount-preview')
    expect(preview).toHaveTextContent('$1,000')
    expect(preview).toHaveTextContent('fortnight')
  })

  it('normalises fortnightly to monthly', () => {
    // 1000/fortnight × 26 / 12 ≈ 2,167/month
    setup({ amount: '1000', frequency: 'fortnightly', salaryCycle: 'monthly' })
    const preview = screen.getByTestId('amount-preview')
    expect(preview).toHaveTextContent('$2,167')
    expect(preview).toHaveTextContent('month')
  })

  it('normalises monthly to fortnightly', () => {
    // 1200/month × 12 / 26 ≈ 554/fortnight
    setup({ amount: '1200', frequency: 'monthly', salaryCycle: 'fortnightly' })
    const preview = screen.getByTestId('amount-preview')
    expect(preview).toHaveTextContent('$554')
    expect(preview).toHaveTextContent('fortnight')
  })
})

describe('AmountFrequencyInput — onChange callbacks', () => {
  it('calls onChange with updated amount when user types', async () => {
    const user = userEvent.setup()
    const { onChange } = setupControlled({ amount: '' })

    await user.type(screen.getByRole('spinbutton'), '500')
    const lastCall = onChange.mock.calls.at(-1)[0]
    expect(lastCall.amount).toBe('500')
    expect(lastCall.frequency).toBe('monthly')
  })

  it('calls onChange with updated frequency when select changes', async () => {
    const user = userEvent.setup()
    const { onChange } = setupControlled({ amount: '1000', frequency: 'monthly' })

    await user.selectOptions(screen.getByRole('combobox'), 'yearly')
    expect(onChange).toHaveBeenCalledWith({ amount: '1000', frequency: 'yearly' })
  })

  it('preserves existing amount when frequency changes', async () => {
    const user = userEvent.setup()
    const { onChange } = setupControlled({ amount: '2500', frequency: 'monthly' })

    await user.selectOptions(screen.getByRole('combobox'), 'fortnightly')
    expect(onChange).toHaveBeenCalledWith({ amount: '2500', frequency: 'fortnightly' })
  })
})
