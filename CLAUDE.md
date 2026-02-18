# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server (prompts for Android/iOS/web)
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator
npm run web        # Run in browser
npm run lint       # Run ESLint (expo lint)
```

No test runner is configured. TypeScript type-checking runs automatically during build.

## Architecture

This is a **React Native Expo app** using **Expo Router** (file-based routing, similar to Next.js) with **TypeScript** and the Expo New Architecture enabled.

### Role-based navigation

The app has three user roles, each with its own bottom-tab navigator:

- **Farmer** (`app/farmer/_layout.tsx`): Donations, Timings, Reports, Settings
- **Volunteer** (`app/volunteer/_layout.tsx`): Shifts, Farms, Donated, Waiver
- **Center** (`app/center/_layout.tsx`): Volunteers, Open Times (+ additional tabs)

Entry point is `app/home.tsx` (role selection screen). `app/index.tsx` redirects there.

### Shared screens

`app/donations.tsx`, `app/shifts.tsx`, `app/reports.tsx`, and `app/settings.tsx` are shared. Role-specific directories (e.g., `app/farmer/donations.tsx`) simply re-export these shared files. This pattern keeps shared logic in one place while satisfying Expo Router's file-based routing.

### State management

All state is local `useState` hooks with hard-coded mock data. No backend integration, no global state library. Many screens in `app/volunteer/` and `app/center/` are stubs with placeholder UI.

### Styling conventions

- All styling via `StyleSheet.create()` (no external CSS framework)
- Color palette: primary green `#3C6E47`, background `#FAF9F6`, dark text `#2C4C3B`
- Icons: `@expo/vector-icons` (Ionicons)
- Modal-based forms for add/edit interactions

### Path alias

`@/*` maps to the project root (configured in `tsconfig.json`).

### Expo config

- `app.json` has `newArchEnabled: true` and React Compiler experiments enabled
- Typed Routes experiment is enabled — use typed `href` values with `router.push()`
