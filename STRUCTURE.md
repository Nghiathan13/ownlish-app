# ownlish — Structure

Frontend: vanilla TypeScript (no UI framework) in `src/`, Tauri 2 shell in `src-tauri/`.
Architecture: Feature-Sliced Design v2.1 (feature-sliced.design).

## Directory tree (hiện tại)

```
ownlish/
├── index.html                      # entry HTML, mounts #app
├── package.json                    # deps + scripts
├── pnpm-workspace.yaml             # pnpm 11 config (allowBuilds)
├── tsconfig.json
├── vite.config.ts                  # dev server, port 1420
├── README.md
├── STRUCTURE.md                    # this file
├── TEST.md                         # testing guide (FSD, CSS governance, unit tests)
├── vitest.setup.ts                 # test setup: WebCrypto polyfill + clearMocks
├── src/                            # frontend
│   ├── app/                        # layer: bootstrap + global, no slices
│   │   ├── entrypoint/
│   │   │   └── main.ts             # bootstrap: load catalog (store) → start router
│   │   ├── routes/                 # router config
│   │   │   ├── index.ts
│   │   │   └── router.ts           # in-memory router: tests <-> test
│   │   └── styles/                 # global styles
│   │       ├── variables.css       # design tokens (only place for literal colors)
│   │       ├── reset.css
│   │       ├── typography.css
│   │       └── global.css
│   ├── pages/tests/                 # slice: 2 màn thật (overview + study)
│   │   ├── index.ts                 # public API
│   │   ├── lib/
│   │   │   └── tests.ts             # view-model: series label, complete, ...
│   │   └── ui/
│   │       ├── tests-overview.ts    # màn 1: card grid từ catalog store (load ở bootstrap)
│   │       ├── tests-overview.css
│   │       ├── tests-study.ts       # màn 2: preload part JSON + render part 1 raw
│   │       ├── tests-study.css
│   │       ├── test-card.ts         # card — ở page tới khi có consumer thứ 2
│   │       └── test-card.css
│   ├── widgets/                    # layer — trống (.gitkeep)
│   ├── features/                   # layer — trống (.gitkeep)
│   ├── entities/toeic-catalog/      # slice: catalog entity
│   │   ├── index.ts                 # public API
│   │   ├── model/
│   │   │   ├── types.ts             # Catalog, CatalogTest, CatalogPart, ...
│   │   │   └── catalog-store.ts     # zustand/vanilla store: catalog + load status
│   │   └── api/
│   │       ├── loadCatalog.ts       # invoke("read_catalog")
│   │       └── loadTestParts.ts     # invoke("read_content_files") — preload part JSON
│   └── shared/                      # layer: no slices
│       ├── lib/                    # trống (.gitkeep)
│       └── ui/                     # trống (.gitkeep)
└── src-tauri/                      # Rust shell
    ├── src/
    │   ├── main.rs                 # binary entry
    │   └── lib.rs                  # Tauri builder + commands (read_catalog, read_content_files)
    ├── capabilities/default.json   # core:default + fs scope ($APPDATA/**)
    ├── tauri.conf.json             # window, CSP, bundle
    ├── Cargo.toml
    └── icons/                      # app icons
```

## Layer rules

- Dependency direction is one-way: app → pages → widgets → features → entities → shared
- A module imports only from layers strictly below
- Slices on the same layer cannot import each other
- Code outside a slice imports it only via its public API (`index.ts`)
- `app/` and `shared/` have no slices; their segments import each other freely
- Conformance: `pnpm check:fsd` (steiger, FSD recommended rules) — run before every commit

## Naming

- Layers: fixed FSD names (app, pages, widgets, features, entities, shared)
- Slices: business domain, kebab-case
- Segments: standard names `ui`, `model`, `lib`, `api`, `config` — purpose, not essence (no `components`, `hooks`, `types`)
- Files: kebab-case; CSS one file per module, BEM `block__element--modifier`; TS PascalCase types/classes, camelCase functions

## Rust (`src-tauri/`)

- `main.rs`: binary entry, calls `lib::run()`
- `lib.rs`: `tauri::Builder` + app commands (`read_catalog`, `read_content_files`)
- `capabilities/default.json`: `core:default` + fs scope (`$APPDATA/**`)
