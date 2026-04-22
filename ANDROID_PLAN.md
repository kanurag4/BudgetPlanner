# Plan: Convert Budget Planner Web App to Android (Capacitor)

## Context

The app is a pure client-side React 19 + Vite SPA with no external API calls. CLAUDE.md explicitly marks it "Capacitor-ready" and notes that `useStorage.js` is the single swap point for native storage. The goal is a working, signed Android APK/AAB with no functional regressions on web.

**Prerequisite (manual, one-time):** Install Android Studio + JDK 17 + Android SDK (API 24 min, API 34 target) and set `ANDROID_HOME` env var before Phase 6.

---

## Phase 1 — Install & Configure Capacitor

### 1.1 Install packages
```bash
npm install @capacitor/core @capacitor/android @capacitor/preferences @capacitor/filesystem @capacitor/share @capacitor/splash-screen
npm install --save-dev @capacitor/cli @capacitor/assets
```

### 1.2 Initialise Capacitor
```bash
npx cap init "Budget Planner" "com.budgetplanner.app" --web-dir dist
```

### 1.3 Create `capacitor.config.ts` (project root)
```ts
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.budgetplanner.app',
  appName: 'Budget Planner',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#fafaf9',   // stone-50
      showSpinner: false,
    },
  },
}
export default config
```
> Never add `server.url` to this file — it breaks offline installs.

### 1.4 Add Android platform
```bash
npx cap add android
```

### 1.5 Add scripts to `package.json`
```json
"cap:build": "npm run build && npx cap sync android",
"cap:sync":  "npx cap sync android",
"cap:open":  "npx cap open android",
"cap:run":   "npx cap run android"
```
`cap:build` preserves the existing tests-gate-build rule by calling `npm run build`.

### 1.6 Bundle Google Fonts (offline support)
`src/index.css` line 1 fetches Plus Jakarta Sans from Google Fonts — fails if the device is offline on first launch.

**Fix:** Replace with a local package:
```bash
npm install @fontsource/plus-jakarta-sans
```
In `src/main.jsx` add at the top:
```js
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
```
Then remove the `@import url('https://fonts.googleapis.com/...')` line from `src/index.css`.

---

## Phase 2 — Fix Web-Only APIs

**File:** `src/components/layout/Header.jsx`

### 2.1 Fix `window.location.href` (line 12) — breaks in Capacitor WebView
```jsx
// Add to imports
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { actions } = useBudget()
  const navigate = useNavigate()              // ADD

  function handleReset() {
    if (window.confirm('Reset everything and start over? This cannot be undone.')) {
      actions.resetAll()
      navigate('/wizard/income')              // REPLACE window.location.href = '/wizard/income'
    }
  }
```

### 2.2 Fix logo `<a href="/">` (line 21-30) — triggers full navigation in WebView
```jsx
import { Link } from 'react-router-dom'

// Replace:
<a href="/" className="..." aria-label="Budget Planner home">
// With:
<Link to="/" className="..." aria-label="Budget Planner home">
// (closing </a> → </Link>)
```

`window.confirm()` on line 10 is fine — works natively in Capacitor's WebView.

---

## Phase 3 — Storage Migration

**File:** `src/hooks/useStorage.js`

Replace the entire file body. Strategy: use localStorage on web/tests (sync, `Capacitor.isNativePlatform()` returns `false` in jsdom so existing tests are unaffected), use `@capacitor/preferences` on native (async, single extra render on first mount):

```js
import { useState, useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'

const USE_NATIVE = Capacitor.isNativePlatform()

async function nativeGet(key) {
  const { Preferences } = await import('@capacitor/preferences')
  const { value } = await Preferences.get({ key })
  return value  // string | null
}
async function nativeSet(key, json) {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.set({ key, value: json })
}
async function nativeRemove(key) {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.remove({ key })
}

export function useStorage(key, defaultValue) {
  const skipNextWrite = useRef(false)
  const hydrated = useRef(false)

  const [value, setValue] = useState(() => {
    if (USE_NATIVE) return defaultValue  // hydrated async below
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return defaultValue
      return JSON.parse(stored)
    } catch {
      return defaultValue
    }
  })

  // Native: async hydration on mount
  useEffect(() => {
    if (!USE_NATIVE) { hydrated.current = true; return }
    nativeGet(key).then(raw => {
      hydrated.current = true
      if (raw === null) return
      try { setValue(JSON.parse(raw)) } catch { /* corrupted — keep default */ }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Persist on value change (after hydration)
  useEffect(() => {
    if (!hydrated.current) return
    if (skipNextWrite.current) { skipNextWrite.current = false; return }
    if (USE_NATIVE) {
      nativeSet(key, JSON.stringify(value)).catch(() => {})
    } else {
      try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota */ }
    }
  }, [key, value])

  function clearValue() {
    skipNextWrite.current = true
    if (USE_NATIVE) nativeRemove(key).catch(() => {})
    else localStorage.removeItem(key)
    setValue(defaultValue)
  }

  return [value, setValue, clearValue]
}
```

Storage keys (`budgetplanner_v1`, `budgetplanner_theme`) are unchanged — no data migration needed.

---

## Phase 4 — PDF Export on Android

**File:** `src/components/dashboard/ExportButton.jsx`

`jsPDF.save()` uses an anchor-click download — silently ignored by Android WebView. Replace the last line of `generatePdf()` (currently line 152: `doc.save(...)`) with a platform-conditional block:

```js
// At top of file, add:
import { Capacitor } from '@capacitor/core'

// Replace line 152 inside generatePdf():
  const dateTag = new Date().toISOString().slice(0, 10)
  const fileName = `budget-summary-${dateTag}.pdf`

  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    const { Share } = await import('@capacitor/share')
    const base64 = doc.output('datauristring').split(',')[1]
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,   // no permission prompt needed
    })
    await Share.share({
      title: 'Budget Planner Summary',
      url: uri,
      dialogTitle: 'Save or share your budget summary',
    })
  } else {
    doc.save(fileName)              // existing web behaviour unchanged
  }
```

No `AndroidManifest.xml` changes needed — `Directory.Cache` requires no permissions; `Share` uses the native intent system.

---

## Phase 5 — App Icon & Splash Screen

Create source assets (do this manually or export from `public/favicon.svg`):
- `assets/icon.png` — 1024×1024 PNG, no padding
- `assets/splash.png` — 2732×2732 PNG, centred artwork on `#fafaf9` (stone-50) background

Then generate all density variants automatically:
```bash
npx @capacitor/assets generate --android
```

This writes all `mipmap-*` folders under `android/app/src/main/res/` and the adaptive icon XML. No manual Photoshop work.

---

## Phase 6 — Build & Run

```bash
# First full build (runs tests → vite build → syncs to android/)
npm run cap:build

# Open Android Studio for first-time Gradle sync (~10 min)
npm run cap:open
# In Android Studio: Build > Make Project — verify it compiles

# Run on connected device or emulator
npm run cap:run
```

**Iterative cycle after any JS change:** `npm run cap:build` then `npm run cap:run`.

For live hot-reload during development only (not production), temporarily add to `capacitor.config.ts`:
```ts
server: { url: 'http://YOUR_LAN_IP:5173', cleartext: true }
```
Run `npm run dev` and deploy once. **Remove before release builds.**

---

## Phase 7 — Signing & Distribution

### 7.1 Generate keystore (one time — store securely, never commit)
```bash
keytool -genkey -v -keystore budget-planner-release.jks -alias budgetplanner \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Budget Planner, O=YourName, C=AU"
```

### 7.2 Configure `android/app/build.gradle`
Inside the `android {}` block:
```gradle
signingConfigs {
  release {
    storeFile     file(System.getenv("KEYSTORE_PATH") ?: "../budget-planner-release.jks")
    storePassword System.getenv("KEYSTORE_PASS")
    keyAlias      "budgetplanner"
    keyPassword   System.getenv("KEY_PASS")
  }
}
buildTypes {
  release {
    signingConfig signingConfigs.release
    minifyEnabled    false   // Capacitor does not support R8 on the web layer
    shrinkResources  false
  }
}
```

### 7.3 Build signed APK (direct install / sideload)
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
adb install android/app/build/outputs/apk/release/app-release.apk
```

### 7.4 Build signed AAB (Google Play Store)
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```
Upload to Google Play Console > Production > Create new release.

### 7.5 Versioning (bump before each release)
In `android/app/build.gradle`:
```gradle
versionCode 1      // integer, increment by 1 each release
versionName "1.0.0"
```

---

## Files Changed

| File | Action | What changes |
|---|---|---|
| `package.json` | Modify | Add Capacitor deps + 4 `cap:*` scripts + `@fontsource` |
| `capacitor.config.ts` | **Create** | New — Capacitor configuration |
| `src/index.css` | Modify | Remove Google Fonts `@import` |
| `src/main.jsx` | Modify | Add `@fontsource/plus-jakarta-sans` imports |
| `src/hooks/useStorage.js` | Modify | Replace with Preferences + localStorage dual-path |
| `src/components/layout/Header.jsx` | Modify | `window.location.href` → `useNavigate`; `<a>` logo → `<Link>` |
| `src/components/dashboard/ExportButton.jsx` | Modify | `doc.save()` → Filesystem+Share on native |
| `assets/icon.png` | **Create** | Source icon for `@capacitor/assets generate` |
| `assets/splash.png` | **Create** | Source splash for `@capacitor/assets generate` |
| `android/app/build.gradle` | Modify | Signing config + versionCode/versionName |

No changes to: wizard steps, engine layer, BudgetContext, ThemeContext, App.jsx, routing, Tailwind config, or any test files.

---

## Verification

1. `npm run cap:build` — all 111 tests pass, Vite builds, `android/` syncs
2. `npm run cap:run` — app loads on emulator/device, wizard works end-to-end
3. Kill the app, reopen — stored state rehydrates correctly (useStorage test)
4. Reset button — navigates to wizard without blank screen
5. Export PDF — native share sheet appears, PDF is well-formed
6. Airplane mode — app loads fully (no Google Fonts request, no API calls)
7. `./gradlew assembleRelease` — signed APK installs via `adb install`
