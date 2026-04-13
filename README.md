# Budget Planner

A personal budget planning web app built for Australians. Enter your income, housing, loans, and expenses through a 6-step wizard and get a clear picture of your cash flow across Regular, Fixed, and Savings buckets — per salary cycle or annually.

## Features

- **6-step wizard** — income (gross or net), housing/loans, groceries, fixed expenses, savings goal, profile
- **Vehicle loan & other loans** — tracked alongside rent/mortgage on the housing step
- **Payslip upload** — drag-and-drop PDF, Excel, or CSV payslip to auto-fill income (client-side, nothing leaves the browser); handles varied payslip layouts including reversed label order, "TOTAL NET PAY - Bank Credit" format, and text-month date ranges for frequency detection
- **Waterfall chart** — visual breakdown of income → regular expenses → fixed expenses → savings
- **Annual bonus card** — bonus kept separate from salary; shown as its own summary card with an "Include bonus" toggle on the savings rate alert
- **Savings rate alert** — compares your actual rate to a personalised AU benchmark (age + family situation); toggle between excluding and including your annual bonus
- **Superannuation card** — employer SGC (12%) shown separately from take-home pay; correctly calculated on gross salary even when you enter take-home pay
- **Expense schedule** — fixed expenses grouped by frequency (fortnightly / monthly / quarterly / yearly)
- **What-if scenario panel** — override salary or housing amount to see the impact without saving
- **Annual / per-cycle toggle** — flip all dashboard figures between monthly/fortnightly and yearly
- **PDF export** — download a clean summary report
- **Dark mode** — persisted to localStorage, toggled from the header
- **Edit button** — jump back to the wizard from the dashboard to adjust any figures
- **Capacitor-ready** — swap `useStorage` for `@capacitor/preferences` to ship as a native iOS/Android app

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Open `http://localhost:5173` in your browser. The app redirects new users to the wizard and returning users (who completed the wizard) directly to the dashboard.

## Commands

```bash
npm run dev        # Dev server with HMR
npm run build      # Tests must pass, then production build
npm run test       # Vitest watch mode
npm run test:ui    # Vitest browser UI
npm run coverage   # Coverage report
npm run preview    # Preview production build
npm run lint       # ESLint
```

## Stack

| Library | Version | Role |
|---------|---------|------|
| React | 19 | UI |
| Vite | 8 | Bundler + dev server |
| Tailwind CSS | v3 | Styling (`darkMode: 'class'`, Plus Jakarta Sans) |
| React Router DOM | v7 | Wizard + dashboard routing |
| Vitest + RTL | latest | Unit + component tests (gate the build) |
| recharts | 3 | Waterfall chart on dashboard (lazy-loaded) |
| pdfjs-dist | 5 | Client-side PDF text extraction for payslip parsing |
| xlsx (SheetJS) | 0.18 | Excel payslip parsing |
| papaparse | 5 | CSV payslip parsing |
| jsPDF | 4 | Client-side PDF export |
| lucide-react | 1 | Icons |

All heavy libraries (`recharts`, `pdfjs-dist`, `xlsx`, `jsPDF`) are code-split and never in the initial bundle.

## Bundle sizes (production, gzipped)

| Chunk | Gzipped | Loaded |
|-------|---------|--------|
| Main bundle (React + Router + Wizard) | ~79 kB | Always |
| Dashboard chunk (recharts + dashboard UI) | ~110 kB | On `/dashboard` visit |
| jsPDF | ~130 kB | On "Export PDF" click |
| pdfjs-dist | ~121 kB | On payslip PDF upload |
| xlsx | ~142 kB | On payslip Excel upload |

## Data & privacy

All data is stored in `localStorage` under key `budgetplanner_v1`. Nothing is sent to a server. Payslip parsing is fully client-side. Dark mode preference is stored separately under `budgetplanner_theme`.

## AU Tax (2025–26)

Uses AU 2025–26 tax brackets: 0% / 15% / 30% / 37% / 45% at thresholds $18,200 / $45,000 / $135,000 / $190,000, plus 2% Medicare levy and LITO (max $700, phases out $37,500–$66,667). Scheduled: first bracket drops to 14% in 2026–27. Employer super rate: 12% SGC (2025–26). When take-home pay is entered instead of gross, the gross is back-calculated via binary search before applying the super rate.

## Project structure

```
src/
├── engine/          # Pure JS financial logic (no React)
│   ├── calculations.js      # calculateBudget() — powers the dashboard
│   ├── normalise.js         # Frequency conversions
│   ├── taxEstimator.js      # AU 2025-26 tax + LITO + Medicare
│   ├── recommendations.js   # Savings rate benchmarks by profile
│   └── payslipParser.js     # PDF / Excel / CSV text extraction
├── context/         # BudgetContext, ThemeContext
├── hooks/           # useBudget, useTheme, useStorage
├── utils/           # constants.js, formatCurrency.js
├── components/
│   ├── ui/          # Button, Card, Toggle, SliderInput, etc.
│   ├── layout/      # Header, StepNavBar
│   ├── wizard/      # WizardShell + 6 step components
│   └── dashboard/   # Dashboard, charts, cards, panels
└── test/            # renderWithProviders, setup
```
