# design-studio — Tests

## FSD structure

- Command: `pnpm check:fsd` (steiger)
- Config: `steiger.config.js` — `fsd.configs.recommended`; `fsd/public-api` off for `src/shared/**`
- Scope: `src/`
- Checks: layer dependency direction, slice isolation (no cross-imports), public API requirement, import locality (same-slice relative / cross-slice absolute), segment presence and naming, slice significance
- Rule reference: https://github.com/feature-sliced/steiger

Other test types (unit, integration, ...) to be added here as the app grows.
