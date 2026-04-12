import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BudgetProvider } from '../context/BudgetContext'
import { ThemeProvider } from '../context/ThemeContext'

export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <BudgetProvider>
          {ui}
        </BudgetProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}
