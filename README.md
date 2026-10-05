# Money Tracker

A PWA for tracking monthly spending. Built for Android (Pixel 9a) as an
installable app, but it works in any mobile browser. White + purple theme,
everything stored locally on the device.

## Running it

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build
```

The service worker and web manifest are generated at build time by
`vite-plugin-pwa`, so `npm run build` produces a fully offline-capable app.

## The three screens

Swipe left/right anywhere to move between them, or use the bottom tab bar.

### 1. Home

- **Summary card**: month name, the month's total, the three biggest categories
  as bar rows, and a reaction face in the top-right corner.
- **Reaction face**: tap it to set the money limits yourself. Default ladder is
  😄 up to €50, 🙂 to €100, 😐 to €200, 😬 to €400, 💸 above that. Change the
  numbers any time, e.g. move the happy face from €50 to €100 next month.
- **Month nav**: `< [October 2026 📅] >` steps between months. Tapping the pill
  opens a list of every month with its total, plus which month was heaviest.
- **9 quick tiles** in a 3×3 grid. Tap to log a purchase. **Long-press** a tile
  to rename it, change its icon, recolour it, or edit its preset amounts.
- **Other expense** button underneath for anything unexpected.

Defaults: Coffee, Food, Kiosk, Fuel, Cigarette, Iris, Subscriptions,
Supermarket, Alcohol.

### 2. Analytics

A chronological statement of the month, newest first, grouped by day with a
daily subtotal. Each row shows a coloured sidebar (category colour), your
title, the category, the time, and the amount on the right.

- **Swipe a row right** to reveal **Edit** (tap it to open the entry, where
  Delete lives).
- **Swipe a row left** to reveal **Cancel** (tap it to strike the entry out).
- Cancelled entries stay visible, crossed through in red, but are excluded
  from every total. Swipe a cancelled row left again to **Restore** it.

### 3. Settings

- All-time total, entry count, current month
- Toggle the bottom tab bar off for full-screen pages (swiping still works)
- Start page, delete confirmation
- Reaction face thresholds
- Every tile: name, icon, colour, preset amounts, slider on/off
- **Backup**: JSON export/import, readable text summary, CSV
- Erase all data

## Logging an expense

Tapping a tile opens the amount sheet:

- Date defaults to today, editable. Time is set to now, editable.
- **Title** shows in analytics, e.g. "water" for a kiosk purchase.
- **Note**, up to 150 characters.
- **Amount** with preset buttons. Defaults:
  - Coffee: 1.50 / 1.70 / 2.60
  - Kiosk: 0.50 / 1.00 / 2.00
  - Fuel: 20.00 / 50.00 / 80.00, plus a slider
  - Cigarette: 1.00 / 2.50 / 7.80
  - Food 5/8/12, Subscriptions 2.99/5.99/9.99, Supermarket 10/25/50, Alcohol 3/5/8
- Always editable, and add or remove presets per tile in Settings.
- The Fuel slider anchors to whichever preset you tapped and runs 50€ above it:
  tap 20.00 and it slides from 20 to 70. Tap 50.00 and it runs 50 to 100.

## Exports

**JSON backup** holds entries, tiles, reaction rules and settings. Import
replaces everything on the device and asks first.

**Readable summary** is plain text: totals per month, per category with share
bars, per day, and every entry with its time and note. Pick this month or all
months.

**CSV** has one row per entry for Excel or Google Sheets.

## Storage

Everything lives in `localStorage` under `money-tracker:v1`. Nothing leaves the
phone. That means clearing browser data wipes it, so export a backup now and
then.

## Project layout

```
src/
  types.ts               domain types
  data/defaults.ts       default tiles, reaction ladder
  lib/
    utils.ts             dates and money formatting
    storage.ts           load/save/repair, localStorage + import validation
    selectors.ts         month totals, category totals, mood lookup
    exportSummary.ts     text and CSV export
    download.ts          file download and file picking
  store/                 reducer, context, persistence
  hooks/                 swipe, long-press gestures
  components/            SummaryCard, EntrySheet, SwipeRow, TabBar, editors
  pages/                 Home, Analytics, Settings
scripts/
  generate-icons.mjs     renders favicon.svg into the Android icon sizes
```

## Installing on Android

Serve the built `dist/` over HTTPS (Cloudflare, GitHub Pages, anything), open
it in Chrome, then **Add to Home screen**. It launches fullscreen with the
purple icon and runs offline after the first load.

## Deploying to Cloudflare Pages

Live URL: **https://money-tracker-77g.pages.dev**

This is a Cloudflare **Pages** project, so it lives on `*.pages.dev`. Static
assets only, no Worker code. `wrangler.jsonc` pins the project name and
compatibility date only.

### The one setting that must be right

**Build & deployments → Build output directory must be `dist`.**

Not the repository root, and not blank. If it points at the repo root, Pages
serves the source `index.html`, which references `/src/main.tsx`. The browser
then tries to run uncompiled TypeScript, the module fails to load, and you get
a blank white page even though every build succeeded. Verify by opening
`https://money-tracker-77g.pages.dev/src/main.tsx` — if you get TypeScript
source instead of a 404, the output directory is wrong.

Do not put `pages_build_output_dir` in `wrangler.jsonc` to work around it.
Declaring it alongside a dashboard output directory fails the build with
"No deployment available". The dashboard owns this setting.

### Build settings

Cloudflare builds the project for you, so no local Node upgrade or API token is
needed.

1. Cloudflare dashboard → **Workers & Pages** → **money-tracker-77g** →
   **Settings** → **Builds & deployments**
2. Set:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Save, then **Retry deployment** on the failed commit

`.node-version` pins the build to Node 22. Pages falls back to `index.html`
for unmatched paths automatically (it only serves a 404 page if a `404.html`
exists, and this project has none), so deep links and the service worker's
navigation requests resolve correctly.

Every push to `main` redeploys. Each deploy gets its own preview URL.

### Deploy from the CLI instead

```powershell
npx wrangler login
npx wrangler pages deploy dist --project-name money-tracker-77g
```

Wrangler 4 needs Node 22+ to run, so upgrade local Node first if you use this
route.

### Why Vite 6

Wrangler refuses to auto-configure a project on Vite 5 ("cannot be
automatically configured. Please update the Vite version to at least 6.0.0").
This project is on Vite 6, with `vite-plugin-pwa` 1.3, `@vitejs/plugin-react`
5.2 and TypeScript 5.9. Vite 6 is the newest major that still runs on Node
20.19, which is what local development uses here.