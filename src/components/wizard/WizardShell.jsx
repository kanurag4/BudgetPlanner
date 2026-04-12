import { Outlet } from 'react-router-dom'
import { Header } from '../layout/Header'
import { StepNavBar } from '../layout/StepNavBar'

export function WizardShell() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      <Header />
      <StepNavBar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
        <Outlet />
      </main>
    </div>
  )
}
