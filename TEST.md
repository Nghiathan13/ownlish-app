# design-studio — Tests

## FSD structure

- Command: `pnpm check:fsd` (steiger)
- Config: `steiger.config.js` — `fsd.configs.recommended`; `fsd/public-api` off for `src/shared/**`
- Scope: `src/`
- Checks: layer dependency direction, slice isolation (no cross-imports), public API requirement, import locality (same-slice relative / cross-slice absolute), segment presence and naming, slice significance
- Rule reference: https://github.com/feature-sliced/steiger

## CSS / color standards

- Command: `pnpm check:style` (stylelint 17)
- Config: `stylelint.config.js` — recommended + `declaration-strict-value`
- Checks: every color property (`/color$/`, `fill`, `stroke`) must use `var(--token)` — no literal/named colors; short lowercase hex; modern color functions; percentage alpha
- Color values live only in `src/app/styles/variables.css` (design tokens — single source of truth)

Other test types (unit, integration, ...) to be added here as the app grows.
