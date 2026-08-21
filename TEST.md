# design-studio — Tests

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

Other test types (unit, integration, ...) to be added here as the app grows.
