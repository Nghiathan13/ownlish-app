# ownlish

Local English learning app (desktop, Tauri 2 + vanilla TypeScript).

## Documentation

- [STRUCTURE.md](STRUCTURE.md) — app structure
- [TEST.md](TEST.md) — tests

## Development

- `pnpm tauri dev` — run with hot reload
- `pnpm build` — type-check and build the frontend
- `pnpm tauri build` — build the distributable app

## Verification

- `pnpm run test:coverage` — run the frontend suite and enforce its coverage gate
- `pnpm run check:fsd` — validate Feature-Sliced Design in `src/`
- `pnpm run check:style` — validate CSS token governance
- `pnpm run test:rust` — run Rust unit tests
- `pnpm run test:rust:coverage` — enforce Rust core coverage gate
- `cd src-tauri && cargo fmt --check` — verify Rust formatting
- `cd src-tauri && cargo clippy -- -D warnings` — reject Rust lints

Rust coverage requires one local toolchain setup: `rustup component add llvm-tools-preview && cargo +stable install cargo-llvm-cov --locked`.
