# CHANGELOG — v1.3.5

## Latest round
- **Real bug fixed:** Three-Dot menu (⋮) — Tools/Settings/Favorites/About
  — visually responded to taps but the dropdown never opened. Root cause:
  `Button` component wasn't using `React.forwardRef`, so Radix's
  `DropdownMenuTrigger asChild` couldn't attach its ref to the real DOM
  button. Fixed. Also fixed leftover Tailwind v4-only syntax in
  `dropdown-menu.tsx` that our v3 setup silently ignored.

## Latest fix
- Added 3 missing tailwind plugin packages to `package.json`
  (`tailwindcss-animate`, `@tailwindcss/typography`,
  `@tailwindcss/container-queries`) — `tailwind.config.js` `require()`s
  them but they were missed because the original dependency scan only
  looked at `.ts`/`.tsx` `import` statements, not `.js` config files'
  `require()` calls. All config `.js` files are now scanned for this too.

## Build-chain stability fixes
- Removed the fragile `tsc -b` project-reference build (caused 2 prior
  Netlify failures: missing `allowJs`, then an input/output file overwrite
  conflict). `build` script is now plain `vite build`; `typecheck` is a
  separate, non-emitting check that can never write to a source file.
- Removed `tsconfig.node.json` (nothing referenced it after the above fix).
- Removed dangling `dedupe: ["@icp-sdk/core"]` from `vite.config.js`.
- `@icp-sdk/core` dependency removed entirely (unpublished version; the
  only file using it, `backend.d.ts`, was itself unused — removed both).
- Fixed the Netlify stale-version bug: `public/sw.js` serves HTML
  navigations network-first instead of always serving stale cached HTML.
- Added missing scaffold files: `package.json`, `index.html`,
  `tsconfig.json`, `postcss.config.js`, `public/manifest.json`,
  `netlify.toml` (base `src/frontend`, publish `dist`, Node 20).
- Removed 3 confirmed-dead files (zero imports anywhere):
  `src/backend.d.ts`, `hooks/useThumbLayerSettings.ts`,
  `hooks/useCalculationHistory.ts`.

## Real bugs fixed
- Scientific Calculator `^` (power) was JS bitwise XOR, not exponentiation.
- DEG/RAD toggle didn't affect sin/cos/tan — now it does.
- Programmer Calculator: chained bitwise ops silently dropped the first
  operand; now chains correctly.
- Programmer Calculator: unbalanced hex keypad layout — fixed.

## Features (condensed — full detail in prior conversation)
- AI Study Assistant: chat UI, manual Play, PDF/text attach, offline
  knowledge base (14+ subjects), Step 1–6 answers, Hindi/English/Mixed
  toggle, Formula On/Off, Regenerate/Similar/Bookmark, "Tuleshwar" loading
  messages, lightweight History+Pin.
- Units: full large→small ranges per category, exact Power unit list,
  searchable picker, Swap/Favorite/Quick-Values/Copy, Smart Recognition,
  Conversion History.
- Admin Panel: Earning System (13 modules), Provider config, Feature
  flags, Maintenance Mode, AI+ usage limit + rewarded-ad flow (demo),
  non-intrusive Ad Slot, non-blocking version banner.
- UI: Tools contrast fix, button sizes, display spacing, full history
  numbers, smooth scrolling, C/AC distinction, Export/Delete confirms,
  compacted Scientific Calculator layout.
