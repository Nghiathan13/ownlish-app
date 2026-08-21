# ownlish — Tests

## FSD structure

- Command: `pnpm check:fsd` (steiger)
- Config: `steiger.config.js` — `fsd.configs.recommended`; `fsd/public-api` off for `src/shared/**`
- Scope: `src/`
- Checks: layer dependency direction, slice isolation (no cross-imports), public API requirement, import locality (same-slice relative / cross-slice absolute), segment presence and naming, slice significance
- Rule reference: https://github.com/feature-sliced/steiger

## CSS / color standards

- Command: `pnpm check:style` (stylelint 17)
- Config: `stylelint.config.js` — recommended + `declaration-strict-value` + `css-property-type-validator`
- Checks:
  - every color property (`/color$/`, `fill`, `stroke`) must use `var(--token)` — no literal/named colors
  - no color functions (`rgb`, `hsl`, `oklch`, ...) in components (`function-disallowed-list`)
  - `var(--token)` must reference an existing token — validated against `src/app/styles/variables.css` (`checkUnknownCustomProperties`)
  - short lowercase hex; modern color functions; percentage alpha; angle hue
- `variables.css` (design tokens — single source of truth) is exempt from `function-disallowed-list`: the only place literal colors/functions may appear
- Known gap (deferred): literal hex inside `linear-gradient()`/shadows is not yet caught — revisit when gradients are used

## Unit tests

- Framework: Vitest 4 + jsdom; config lives in `vite.config.ts` (shares the Vite pipeline and `@/` alias)
- Setup: `vitest.setup.ts` — WebCrypto polyfill for jsdom + `clearMocks()` after each test
- Command: `pnpm test` (CI, single run) / `pnpm test:watch` (dev) / `pnpm test:coverage` (coverage + gate)
- Tests are colocated: `*.test.ts` next to the code, inside the same segment
- Tauri IPC is mocked with the official `@tauri-apps/api/mocks` `mockIPC()` — no Rust backend runs
- Coverage gate (enforced in CI): statements/branches/functions/lines ≥ 90% — current: 99/94/100/99
- Rust unit tests: `cargo test` (src-tauri) — path-safety of `read_content_files` (absolute/`..`/symlink escape)
- Part preload is cached short-term via TanStack Query (`shared/api/query-client.ts` — staleTime/gcTime 5 min, no retry; `entities/toeic-catalog/api/test-parts-query.ts`)
- Coverage (31 tests):
  - `app/entrypoint` — main.ts bootstrap (load → overview render, catalog failure message)
  - `app/routes` — router (tests ↔ test navigation, card click, fallback)
  - `entities/toeic-catalog/api` — loadCatalog (`read_catalog` + JSON parse), loadTestParts (paths + mapping), test-parts-query (cache miss/hit/clear, key scope, client defaults)
  - `entities/toeic-catalog/model` — catalog-store (idle → loading → ready / error / non-Error rejection)
  - `pages/tests/lib` — buildTestCardViewModel (ETS/YBM labels, complete = 7 parts)
  - `pages/tests/ui` — test-card (button/title/click), tests-overview (grid + selection), tests-study (render + preload + failure)
