# design-studio — Structure

Frontend: vanilla TypeScript (no UI framework) in `src/`, Tauri 2 shell in `src-tauri/`.
Structure only — usage in README.md.

## Directory tree

```
design-studio/
├── index.html                      # entry HTML, mounts #app
├── package.json                    # deps + scripts
├── pnpm-workspace.yaml             # pnpm 11 config (allowBuilds)
├── tsconfig.json
├── vite.config.ts                  # dev server, port 1420
├── README.md
├── STRUCTURE.md                    # this file
├── src/                            # frontend
│   ├── app/                        # bootstrap + shell
│   │   ├── main.ts                 # entry point
│   │   ├── layout.ts               # app shell: controls + canvas
│   │   └── layout.css
│   ├── pages/                      # screen composition
│   │   ├── workspace.ts            # workspace page
│   │   └── workspace.css
│   ├── features/                   # one folder per capability
│   │   ├── color-picker/           # color tokens editor
│   │   ├── size-control/           # size/spacing tokens editor
│   │   ├── radius-control/         # radius tokens editor
│   │   └── block-canvas/           # block patterns render + select
│   ├── entities/                   # models + stores
│   │   ├── token/                  # design token model, store, CSS var sync
│   │   └── pattern/                # block/pattern model
│   └── shared/                     # no upward imports
│       ├── lib/                    # pure utils: color math, dom, storage
│       └── styles/                 # reset.css, variables.css, typography.css, global.css
└── src-tauri/                      # Rust shell
    ├── src/
    │   ├── main.rs                 # binary entry
    │   └── lib.rs                  # Tauri builder (no commands yet)
    ├── capabilities/default.json   # window permissions
    ├── tauri.conf.json             # window, CSP, bundle
    ├── Cargo.toml
    └── icons/                      # app icons
```

Note: `app/`, `pages/`, `features/`, `entities/` are the target layout (to be built); current `src/main.ts` + `src/styles.css` move into it.

## Layer rules

- Dependency direction is one-way: app → pages → features → entities → shared
- `shared/` imports nothing above itself
- `entities/` imports `shared/` only
- `features/` import `entities/` + `shared/`
- `pages/` compose features
- `app/` wires pages + bootstrap

## Naming

- Files: kebab-case (`color-picker.ts`)
- CSS: one file per module, same basename; BEM `block__element--modifier`
- TS: PascalCase types/classes, camelCase functions/variables

## Rust (`src-tauri/`)

- `main.rs`: binary entry, calls `lib::run()`
- `lib.rs`: `tauri::Builder` — empty for now; project save/load commands added here when needed
- `capabilities/default.json`: `core:default` only
