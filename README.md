# TCalc AI — v1.3.5 — Final Source

## Latest fix (this round)
- **Real bug found and fixed:** Three-Dot menu (Tools/Settings/Favorites/
  About) opened visually (button "pressed" state) but never actually
  showed its dropdown. Root cause: the shared `Button` component wasn't
  using `React.forwardRef`, so when Radix's `DropdownMenuTrigger asChild`
  tried to attach its ref to the real DOM button (needed for click
  detection + positioning), React silently dropped it. Fixed by wrapping
  `Button` in `forwardRef`.
- Also fixed: `dropdown-menu.tsx` had Tailwind v4-only class syntax
  (`max-h-(--var)`, `origin-(--var)`, `outline-hidden`) that our
  Tailwind v3 setup couldn't parse — converted to v3-compatible syntax.
- Audited every other UI primitive for the same asChild/forwardRef
  pattern: confirmed `Button` was the only *live* instance (a few other
  components share the pattern but are either never used with `asChild`
  or are themselves dead/unreferenced code — left untouched per the
  no-unnecessary-changes rule).

## Verification performed (static — no real build run here)
- 111 source files, 0 syntax errors, 0 brace mismatches, 0 broken imports
- Every package imported anywhere in `.ts`/`.tsx` source AND every
  `require()`/`import` in every `.js` config file cross-checked against
  `package.json` — nothing missing
- All config files valid: package.json, tsconfig.json, manifest.json,
  vite.config.js, postcss.config.js, sw.js

## I still cannot run a real build here
No network access, no node_modules, in this sandbox. Please run:
```
pnpm install
pnpm typecheck
pnpm build
pnpm dev --host 0.0.0.0
```
and send exact output if anything fails.

See CHANGELOG.md and PENDING_WORK.md for full history and honest gaps.
