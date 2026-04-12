# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Run all tests then production build — fails if any test fails
npm run test       # Run tests in watch mode
npm run test:ui    # Vitest browser UI
npm run coverage   # Coverage report (engine layer targets 100%)
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

Run a single test file:
```bash
npx vitest run src/engine/calculations.test.js
```

**Tests gate the build.** `npm run build` runs `vitest run` first; if any test fails, the Vite build does not start.

## Build status

All 13 original steps are complete. The app is fully built and running.

| Step | What | Status |
|------|------|--------|
| 1 | Foundation — Vite, Tailwind v3, constants, Vitest | ✅ |
| 2 | `useStorage` hook | ✅ |
| 3 | Engine layer (normalise, tax, recommendations, calculations, payslipParser) | ✅ |
| 4 | State layer (BudgetContext, ThemeContext) | ✅ |
| 5 | UI atoms (Button, Card, Toggle, Tooltip, AlertBanner, SliderInput, ProgressBar, AmountFrequencyInput) | ✅ |
| 6 | Layout (Header, StepNavBar) | ✅ |
| 7 | Payslip UI (PayslipUploader, PayslipReviewCard) | ✅ |
| 8 | Component tests (SavingsSplitSliders, StepIncome) | ✅ |
| 9 | Wizard (WizardShell + all 6 steps) | ✅ |
| 10 | Dashboard core (ViewToggle, SummaryCards, BucketWaterfallChart, BucketBreakdown, SavingsSplitSliders) | ✅ |
| 11 | Dashboard features (SuperannuationCard, SavingsRateAlert, ExpenseCalendar, ScenarioPanel, ExportButton) | ✅ |
| 12 | Routing + redirect logic (App.jsx wired up, Dashboard lazy-loaded) | ✅ |
| 13 | Dark mode pass + mobile polish | ✅ |

**Post-launch additions:**
- Waterfall chart replaced the original donut chart (user preference)
- Vehicle loan + other loans added to StepHousing and regularBucket
- "Edit" button on dashboard navigates back to wizard
- Dashboard lazy-loaded via `React.lazy` — removed recharts from initial bundle (195 kB → 79 kB gzipped)

## Architecture

Pure client-side SPA (React 19 + Vite + Tailwind CSS v3 + React Router DOM v7). No backend, no API calls. Built Capacitor-ready.

### Data flow

1. User fills the 6-step wizard → state written to `BudgetContext` on each step
2. Every state change is persisted via `useStorage` hook (localStorage key `budgetplanner_v1`) — **except `scenario`**, which is session-only
3. On page load, state hydrates from storage; if `wizardStep >= 7`, redirect to `/dashboard`
4. Dashboard calls `calculateBudget(state)` — a pure function — and renders results

### Storage split in BudgetContext

`BudgetContext` splits state into two parts:
- **Persisted** (`useStorage`): everything except `scenario`
- **Session-only** (`useState`): `scenario` — cleared on refresh, never touches localStorage

`ThemeContext` uses its own key (`budgetplanner_theme`) separate from the main budget key.

### Three output buckets

All amounts normalised to the user's **salary cycle** (`fortnightly` only when primary salary is fortnightly, otherwise `monthly`):

- **Regular** — housing + groceries + vehicle loan + other loans
- **Fixed** — all fixed expenses normalised to salary cycle
- **Savings** — remainder; split via sliders (splurge / emergency / investment, always sum to 100%)

A separate **Superannuation** line (11.5% of gross) is shown as forced savings.

### Engine layer (`src/engine/`)

Pure functions, no React imports. All new financial logic goes here.

| File | Key export |
|------|-----------|
| `normalise.js` | `normaliseToFrequency(amount, fromFreq, toFreq)`, `resolveSalaryCycle(freq)` |
| `calculations.js` | `calculateBudget(state, useScenario=false)` |
| `taxEstimator.js` | `estimateNetPay(grossAmount, frequency)` |
| `recommendations.js` | `getRecommendation({ ageGroup, familySituation, numberOfKids }, actualRate)` |
| `payslipParser.js` | `parsePayslip(file)` → `Promise<{ netPay, frequency, confidence, rawText }>` |

### AU tax details (2025–26)

Brackets: 0% / 15% / 30% / 37% / 45% at thresholds 18,200 / 45,000 / 135,000 / 190,000. LITO max $700, phases out $37,500–$66,667. Medicare levy 2%. Scheduled: first bracket drops to 14% in 2026–27. All values live in `src/utils/constants.js`.

### Savings rate recommendations

Base rates by age group (under25→10%, 25-34→15%, 35-44→20%, 45-54→25%, 55+→30%). Family adjustments: `couple` and `couple+kids` both get −2%, then −2% per kid capped at −6% for kids alone (max total −8% from single baseline). Floor 5%. Alert severity: green = at/above, amber = within 5% below, red = more than 5% below.

### State shape

```
income.primarySalary   { amount, frequency, isGross }
income.partnerSalary   { enabled, amount, frequency, isGross }
income.bonus           { amount }
housing                { type: "loan"|"rent", amount, frequency,
                         vehicleLoan: { enabled, amount, frequency },
                         otherLoans:  { enabled, amount, frequency } }
groceries              { amount, frequency }
fixedExpenses[]        { id, name, amount, frequency }
savingsGoal            { enabled, type: "percentage"|"flat", value, frequency }
profile                { familySituation, numberOfKids, ageGroup }
splitSliders           { splurge, emergency, investment }   // always sum to 100
dashboardView          "cycle" | "annual"
scenario               { active, overrides }                // never persisted
wizardStep             number  // 7 = wizard complete, redirect to dashboard
```

### Wizard

`WizardShell` wraps all wizard steps using React Router's `<Outlet>`. Each step component handles its own Next/Back navigation via `useNavigate`. `wizardStep` is advanced on Next — reaching 7 means the wizard is complete.

Each step derives `salaryCycle` from `income.primarySalary.frequency` and passes it to `AmountFrequencyInput` as a prop so the live preview normalises correctly.

Navigation pattern in every step:
```js
function handleNext() {
  actions.setWizardStep(n)    // advance the step counter
  navigate('/wizard/next-route')
}
```

### Routing

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `RootRedirect` | `wizardStep >= 7` → `/dashboard`, else → `/wizard/income` |
| `/wizard/*` | `WizardShell` + nested steps | Eagerly loaded |
| `/wizard/income` | `StepIncome` | |
| `/wizard/housing` | `StepHousing` | Rent/mortgage + vehicle loan + other loans |
| `/wizard/groceries` | `StepGroceries` | |
| `/wizard/fixed` | `StepFixedExpenses` | |
| `/wizard/savings` | `StepSavingsGoal` | |
| `/wizard/profile` | `StepProfile` | |
| `/dashboard` | `Dashboard` | **Lazy-loaded** via `React.lazy` — recharts excluded from main bundle |

`RootRedirect` must render inside `BudgetProvider` to read `state.wizardStep`.

### Code splitting

`Dashboard` and its entire sub-tree (recharts, all dashboard components) are lazy-loaded. Main bundle is ~79 kB gzipped. The dashboard chunk (~110 kB gzipped) loads on first `/dashboard` visit and is then cached. A skeleton fallback is shown via `<Suspense>` during load.

`pdfjs-dist`, `xlsx`, and `jsPDF` are already lazy-loaded inside their respective call sites and are never in the initial bundle.

### splitSliders constraint

When one slider moves, the other two redistribute proportionally. This logic lives in `BudgetContext.redistributeSliders()`, not in any component. `updateSplitSlider(key, value)` is the only way to change sliders.

### Storage abstraction

All reads/writes use `src/hooks/useStorage.js`, never direct `localStorage` calls. This hook is the single swap point for Capacitor: replace its body with `@capacitor/preferences` and no component changes are needed. The hook uses a `skipNextWrite` ref to prevent writing back to storage immediately after `clearValue()`.

## Testing

**Framework:** Vitest + React Testing Library. Setup file: `src/test/setup.js`. Test environment: jsdom.

### Rules for component tests

- **Always `beforeEach(() => localStorage.clear())`** — `BudgetProvider` reads localStorage on mount, so tests within a file pollute each other without this.
- **Use `src/test/renderWithProviders.jsx`** — wraps with `MemoryRouter + ThemeProvider + BudgetProvider`. Required for any component that uses `useBudget`, `useTheme`, or `useNavigate`.
- **Use `await screen.findByRole(...)` not `screen.getByRole(...)`** after state-changing interactions — the re-render triggered by context updates is async from the test's perspective.
- **For controlled inputs**, use a stateful `Wrapper` component so the input value updates between keystrokes (see `AmountFrequencyInput.test.jsx`).

### Test files

| File | What it covers |
|------|---------------|
| `engine/normalise.test.js` | Frequency conversions, salary cycle resolution |
| `engine/calculations.test.js` | Bucket totals, over-budget, partner income, scenario overrides, split amounts |
| `engine/taxEstimator.test.js` | AU 2025-26 bracket boundaries, Medicare levy, LITO |
| `engine/recommendations.test.js` | Age × family combinations, floor, alert severity |
| `engine/payslipParser.test.js` | Keyword extraction, low-confidence fallback |
| `hooks/useStorage.test.js` | Read/write/clear, invalid JSON fallback |
| `components/ui/AmountFrequencyInput.test.jsx` | Live preview normalisation, onChange callbacks |
| `components/dashboard/SavingsSplitSliders.test.jsx` | Slider redistribution, always sums to 100 |
| `components/wizard/StepIncome.test.jsx` | Gross toggle show/hide, partner toggle show/hide, Next disabled state |

## UI components

Design system: Plus Jakarta Sans, emerald-500 primary, amber-400 accent, stone-50 bg. All interactive elements `min-h-[44px]` (Capacitor tap target). Dark mode via `dark:` Tailwind variants throughout.

**`AmountFrequencyInput`** — used on nearly every wizard step. Accepts `salaryCycle` prop for live preview. Modify carefully.

**`SavingsSplitSliders`** — calls `actions.updateSplitSlider(key, val)` only. Never manages redistribution itself.

**`scenario` overrides** — never written to storage. Session only, cleared on refresh or `clearScenario()`.

**`pb-safe`** — custom Tailwind utility in `index.css` using `env(safe-area-inset-bottom)` for iPhone home indicator. Applied to wizard bottom nav containers.

**`pb-safe-lg`** — same but `max(2.5rem, ...)`. Applied to dashboard main content area.
