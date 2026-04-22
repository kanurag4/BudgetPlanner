import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BudgetProvider } from './context/BudgetContext'
import { ThemeProvider } from './context/ThemeContext'
import { useBudget } from './hooks/useBudget'

import { WizardShell } from './components/wizard/WizardShell'
import { StepIncome } from './components/wizard/StepIncome'
import { StepHousing } from './components/wizard/StepHousing'
import { StepGroceries } from './components/wizard/StepGroceries'
import { StepFixedExpenses } from './components/wizard/StepFixedExpenses'
import { StepSavingsGoal } from './components/wizard/StepSavingsGoal'
import { StepProfile } from './components/wizard/StepProfile'
import { Header } from './components/layout/Header'

// Dashboard is code-split — recharts only loads when the user navigates here
const Dashboard = lazy(() =>
  import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard }))
)

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-10 flex flex-col gap-5">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
        {/* Chart card */}
        <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        {/* Breakdown cards */}
        <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
    </div>
  )
}

/**
 * Root redirect: if wizardStep >= 7 → /dashboard, otherwise → /wizard/income.
 * Must live inside BudgetProvider to read state.
 */
function RootRedirect() {
  const { state } = useBudget()
  return state.wizardStep >= 7
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/wizard/income" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/wizard" element={<WizardShell />}>
        <Route index element={<Navigate to="/wizard/income" replace />} />
        <Route path="income"    element={<StepIncome />} />
        <Route path="housing"   element={<StepHousing />} />
        <Route path="groceries" element={<StepGroceries />} />
        <Route path="fixed"     element={<StepFixedExpenses />} />
        <Route path="savings"   element={<StepSavingsGoal />} />
        <Route path="profile"   element={<StepProfile />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
          </Suspense>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <BudgetProvider>
          <AppRoutes />
        </BudgetProvider>
      </ThemeProvider>
    </HashRouter>
  )
}

export default App
