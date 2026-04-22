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
- Manual additional loans (arbitrary name + amount + frequency) added to StepHousing
- "Edit" button on dashboard navigates back to wizard
- Dashboard lazy-loaded via `React.lazy` — removed recharts from initial bundle (195 kB → 79 kB gzipped)
- Household bills (Utilities, Council rates, Strata fees, Health insurance) added to StepGroceries
- Fixed expenses quick-add chips (Netflix, Gym, Amazon Prime, etc.) in StepFixedExpenses
- Superannuation rate updated to 12% (2025–26 SGC schedule)
- BudgetContext forward-compat: stored state merged with DEFAULT_PERSISTED on hydration so new keys never crash old saved data
- Weekly frequency added to income, expense, and housing frequency lists; `resolveSalaryCycle` returns `'weekly'|'fortnightly'|'monthly'`; dashboard shows "per week" when salary is weekly
- Dashboard summary cards: font reduced to `text-xl` (no truncation) so large annual figures display in full
- BucketBreakdown Fixed Expenses card: "Set aside per [cycle]" footer shows per-cycle amount to cover all fixed costs, always in per-cycle terms regardless of annual toggle
- payslipParser: fixed pdfjs-dist v5 worker (was `workerSrc=''`, now uses `?url` static import); added date-range frequency inference (detects weekly/fortnightly/monthly from pay period dates when no keyword is present)
- Bonus separated from salary cycle income: `netIncomePerCycle` = salary only; bonus shown as its own "Annual Bonus" summary card (always annual, amber); new `netIncomeWithBonusPerCycle`, `actualSavingsWithBonus`, `savingsRateWithBonus` fields added to `calculateBudget` return
- SavingsRateAlert: "Include bonus" slide toggle — when on, rate is recalculated including the annualised bonus; only shown when a bonus is set
- Super fix: when user enters net (take-home) pay, gross is now back-calculated via `estimateGrossFromNet()` (binary search) before applying the 12% SGC rate — previously super was incorrectly based on take-home pay
- StepProfile: "Age group" label renamed to "Your age group"
- payslipParser: 3 new net pay patterns covering reversed amount-before-label layout, "TOTAL NET PAY - Bank Credit $x" format, and amount-before-employer-super line; frequency detection now runs date-range inference before falling back to annual/yearly keywords (prevents "Annual leave balance" false-positives); `inferFrequencyFromDateRange` extended to parse text-month date formats ("29 Jun 20 - 05 Jul 20")

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

On hydration, stored data is shallow-merged with `DEFAULT_PERSISTED` so new top-level keys added after a user first saved data are always present:
```js
const persisted = { ...DEFAULT_PERSISTED, ...storedPersisted }
```

`ThemeContext` uses its own key (`budgetplanner_theme`) separate from the main budget key.

### Three output buckets

All amounts normalised to the user's **salary cycle** (`weekly` if salary is weekly, `fortnightly` if fortnightly, otherwise `monthly`):

- **Regular** — housing + groceries + vehicle loan + other loans + additional loans + household bills
- **Fixed** — all fixed expenses normalised to salary cycle
- **Savings** — remainder; split via sliders (splurge / emergency / investment, always sum to 100%)

A separate **Superannuation** line (12% of gross, 2025–26 SGC rate) is shown as forced savings.

### Engine layer (`src/engine/`)

Pure functions, no React imports. All new financial logic goes here.

| File | Key export |
|------|-----------|
| `normalise.js` | `normaliseToFrequency(amount, fromFreq, toFreq)`, `resolveSalaryCycle(freq)` |
| `calculations.js` | `calculateBudget(state, useScenario=false)` |
| `taxEstimator.js` | `estimateNetPay(grossAmount, frequency)`, `estimateGrossFromNet(yearlyNet)` |
| `recommendations.js` | `getRecommendation({ ageGroup, familySituation, numberOfKids }, actualRate)` |
| `payslipParser.js` | `parsePayslip(file)` → `Promise<{ netPay, frequency, confidence, rawText }>`; handles reversed label order, "TOTAL NET PAY - ..." format, amount-before-super-line, and text-month date ranges |

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
                         vehicleLoan:     { enabled, amount, frequency },
                         otherLoans:      { enabled, amount, frequency },
                         additionalLoans: [{ id, name, amount, frequency }] }
groceries              { amount, frequency }
householdBills         { utilities:        { enabled, amount, frequency },
                         councilFees:      { enabled, amount, frequency },
                         strataFees:       { enabled, amount, frequency },
                         medicalInsurance: { enabled, amount, frequency } }
fixedExpenses[]        { id, name, amount, frequency }
savingsGoal            { enabled, type: "percentage"|"flat", value, frequency }
profile                { familySituation, numberOfKids, ageGroup }
splitSliders           { splurge, emergency, investment }   // always sum to 100
dashboardView          "cycle" | "annual"
scenario               { active, overrides }                // never persisted
wizardStep             number  // 7 = wizard complete, redirect to dashboard
```

### Wizard steps

| Route | Component | Notes |
|-------|-----------|-------|
| `/wizard/income` | `StepIncome` | Primary + partner salary, gross/net toggle, bonus |
| `/wizard/housing` | `StepHousing` | Rent/mortgage + vehicle loan + other loans + manual additional loans |
| `/wizard/groceries` | `StepGroceries` | Grocery spend + household bills (utilities/quarterly/monthly/fortnightly/weekly, council, strata, health insurance) |
| `/wizard/fixed` | `StepFixedExpenses` | Fixed expenses with quick-add chips (Netflix, Gym, Amazon Prime, etc.) + manual add |
| `/wizard/savings` | `StepSavingsGoal` | Savings goal (% or flat amount) |
| `/wizard/profile` | `StepProfile` | Age group, family situation, number of kids |

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
| `/dashboard` | `Dashboard` | **Lazy-loaded** via `React.lazy` — recharts excluded from main bundle |

`RootRedirect` must render inside `BudgetProvider` to read `state.wizardStep`.

Uses `HashRouter` (not `BrowserRouter`) for GitHub Pages compatibility — URLs are `/#/wizard/income` etc.

### Code splitting

`Dashboard` and its entire sub-tree (recharts, all dashboard components) are lazy-loaded. Main bundle is ~79 kB gzipped. The dashboard chunk loads on first `/dashboard` visit and is then cached. A skeleton fallback is shown via `<Suspense>` during load.

`pdfjs-dist`, `xlsx`, and `jsPDF` are already lazy-loaded inside their respective call sites and are never in the initial bundle.

### splitSliders constraint

When one slider moves, the other two redistribute proportionally. This logic lives in `BudgetContext.redistributeSliders()`, not in any component. `updateSplitSlider(key, value)` is the only way to change sliders.

### Storage abstraction

All reads/writes use `src/hooks/useStorage.js`, never direct `localStorage` calls. This hook is the single swap point for Capacitor: replace its body with `@capacitor/preferences` and no component changes are needed. The hook uses a `skipNextWrite` ref to prevent writing back to storage immediately after `clearValue()`.

### BudgetContext actions reference

| Action | Signature | What it does |
|--------|-----------|--------------|
| `updatePrimarySalary` | `(subPatch)` | Patch `income.primarySalary` |
| `updatePartnerSalary` | `(subPatch)` | Patch `income.partnerSalary` |
| `updateBonus` | `(subPatch)` | Patch `income.bonus` |
| `updateHousing` | `(subPatch)` | Shallow-patch `housing` |
| `addHousingLoan` | `({ name, amount, frequency })` | Append to `housing.additionalLoans` |
| `updateHousingLoan` | `(id, subPatch)` | Update one additional loan |
| `removeHousingLoan` | `(id)` | Remove one additional loan |
| `updateGroceries` | `(subPatch)` | Patch `groceries` |
| `updateHouseholdBill` | `(key, subPatch)` | Patch `householdBills[key]` |
| `addFixedExpense` | `({ name, amount, frequency })` | Append to `fixedExpenses` |
| `updateFixedExpense` | `(id, subPatch)` | Update one fixed expense |
| `removeFixedExpense` | `(id)` | Remove one fixed expense |
| `updateSavingsGoal` | `(subPatch)` | Patch `savingsGoal` |
| `updateProfile` | `(subPatch)` | Patch `profile` |
| `updateSplitSlider` | `(key, value)` | Move one slider; redistributes the other two |
| `setDashboardView` | `(view)` | `'cycle'` or `'annual'` |
| `setWizardStep` | `(step)` | Advance wizard step counter |
| `updateScenario` | `(subPatch)` | Patch session-only `scenario` |
| `setScenarioOverride` | `(overridePatch)` | Patch `scenario.overrides` |
| `clearScenario` | `()` | Reset scenario to defaults |
| `resetAll` | `()` | Clear localStorage + reset scenario |

### calculateBudget return values

Key values returned by `calculateBudget(state, useScenario=false)`:

```
salaryCycle                  'monthly' | 'fortnightly' | 'weekly'
periodsPerYear               12 | 26 | 52
netIncomePerCycle            primary net + partner net (salary only, bonus excluded)
primaryNetPerCycle
partnerNetPerCycle
bonusPerCycle                bonus / periodsPerYear (for reference; not in netIncomePerCycle)
bonusAnnual                  raw annual bonus amount
netIncomeWithBonusPerCycle   netIncomePerCycle + bonusPerCycle
superPerCycle                12% of gross (employer SGC; gross back-calculated when user enters net pay)
regularBucket                housing + groceries + all loans + household bills, per cycle
housingPerCycle
groceriesPerCycle
vehicleLoanPerCycle
otherLoansPerCycle
additionalLoansPerCycle      sum of all manual housing.additionalLoans
utilitiesPerCycle
councilFeesPerCycle
strataFeesPerCycle
medicalInsurancePerCycle
fixedBucket                  sum of all fixedExpenses, per cycle
totalExpenses                regularBucket + fixedBucket
actualSavings                netIncomePerCycle - totalExpenses (excl. bonus)
savingsRate                  % of net salary saved (excl. bonus)
actualSavingsWithBonus       netIncomeWithBonusPerCycle - totalExpenses
savingsRateWithBonus         % of net income saved incl. bonus
savingsGoalAmount            target savings per cycle
splitAmounts                 { splurge, emergency, investment } per cycle
...Annual                    annual equivalents of all per-cycle values
```

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
| `engine/taxEstimator.test.js` | AU 2025-26 bracket boundaries, Medicare levy, LITO, `estimateGrossFromNet` round-trip |
| `engine/recommendations.test.js` | Age × family combinations, floor, alert severity |
| `engine/payslipParser.test.js` | Keyword extraction, low-confidence fallback, reversed-label and employer-super patterns |
| `hooks/useStorage.test.js` | Read/write/clear, invalid JSON fallback |
| `components/ui/AmountFrequencyInput.test.jsx` | Live preview normalisation, onChange callbacks |
| `components/dashboard/SavingsSplitSliders.test.jsx` | Slider redistribution, always sums to 100 |
| `components/wizard/StepIncome.test.jsx` | Gross toggle show/hide, partner toggle show/hide, Next disabled state |

## UI components

Design system: Plus Jakarta Sans, slate palette (slate-900 bg, slate-800 card, slate-700 border), sky-400/500 accent (buttons, focus rings, active states), dark mode on by default. Semantic colours: emerald = income/savings/positive, rose = fail/over-budget, amber = warning. All interactive elements `min-h-[44px]` (Capacitor tap target). Dark mode via `dark:` Tailwind variants throughout. See `C:\Projects\Rules\kashvector-design.md` for full token reference.

**`AmountFrequencyInput`** — used on nearly every wizard step. Accepts `salaryCycle` prop for live preview. Modify carefully.

**`SavingsSplitSliders`** — calls `actions.updateSplitSlider(key, val)` only. Never manages redistribution itself.

**`scenario` overrides** — never written to storage. Session only, cleared on refresh or `clearScenario()`.

**`pb-safe`** — custom Tailwind utility in `index.css` using `env(safe-area-inset-bottom)` for iPhone home indicator. Applied to wizard bottom nav containers.

**`pb-safe-lg`** — same but `max(2.5rem, ...)`. Applied to dashboard main content area.

## Deployment

### GitHub Pages (development/standalone)

Hosted on GitHub Pages at `kanurag4/BudgetPlanner`. GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers on push to `master` and builds with `VITE_BASE_PATH` repo variable. Uses `HashRouter` so deep links work without a server-side catch-all.

### kashvector.com (production hub — Option A)

The canonical production deployment is as a subfolder at `kashvector.com/budget/`, which is part of a multi-tool hub at `kashvector.com` (hosted via Cloudflare Pages from `C:\Projects\StockAnalysis`).

**Deploy workflow:**

1. Build with the correct base path (Git Bash on Windows — `MSYS_NO_PATHCONV=1` prevents Git Bash from converting the path):
   ```bash
   MSYS_NO_PATHCONV=1 VITE_BASE_PATH='/budget/' npm run build
   ```
2. Copy `dist/` into the StockAnalysis repo:
   ```bash
   cp -r dist/. "C:/Projects/StockAnalysis/www/budget/"
   ```
3. Commit and push from `C:\Projects\StockAnalysis` — Cloudflare Pages auto-deploys.

**Why `VITE_BASE_PATH=/budget/` matters:** The default build produces root-relative asset paths (`/assets/...`). Without the base path set, all JS/CSS will 404 when served from `/budget/`.

**Sibling tools on kashvector.com:**
- `kashvector.com/` — landing page (links to all tools)
- `kashvector.com/stock/` — Stock Evaluator (vanilla JS, no build step)
- `kashvector.com/budget/` — this app

The two projects are developed independently. The Stock Evaluator lives at `C:\Projects\StockAnalysis`. No Worker changes are needed — both tools share the same `Origin: https://kashvector.com` header, which is already in the Worker's allowlist (though the budget planner makes no Worker calls).
