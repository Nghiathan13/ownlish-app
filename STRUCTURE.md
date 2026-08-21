# ownlish — Structure

Frontend: vanilla TypeScript (no UI framework) in `src/`, Tauri 2 shell in `src-tauri/`.
Architecture: Feature-Sliced Design v2.1 (feature-sliced.design) for the frontend; a layered Rust backend for `src-tauri/`.

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
│   │   │   └── router.ts           # in-memory router: tests/dashboard/test (study full-screen)
│   │   └── styles/                 # global styles
│   │       ├── variables.css       # design tokens (only place for literal colors)
│   │       ├── reset.css
│   │       ├── typography.css
│   │       └── global.css
│   ├── pages/tests/                 # slice: 2 màn thật (overview + study)
│   │   ├── index.ts                 # public API
│   │   ├── lib/
│   │   │   ├── tests.ts             # view-model: series label, complete, ...
│   │   │   └── study.ts             # view-model: parseUnits (part → items | groups)
│   │   └── ui/
│   │       ├── tests-overview.ts    # màn 1: card grid từ catalog store (load ở bootstrap)
│   │       ├── tests-overview.css
│   │       ├── tests-study.ts       # màn 2: topnav + back, preload + câu 1 raw
│   │       ├── tests-study.css
│   │       ├── tests-topnav.ts       # topnav (border-bottom) + back button
│   │       ├── tests-topnav.css
│   │       ├── tests-botnav.ts       # botnav (border-top) — prev/next chevrons
│   │       ├── tests-botnav.css
│   │       ├── test-card.ts         # card — ở page tới khi có consumer thứ 2
│   │       └── test-card.css
│   ├── pages/dashboard/             # slice: màn dashboard (title, chờ content thật)
│   │   ├── index.ts                 # public API
│   │   └── ui/
│   │       ├── dashboard.ts
│   │       └── dashboard.css
│   ├── widgets/sidebar/             # slice: nav sidebar (collapsible rail, active state)
│   │   ├── index.ts                 # public API
│   │   ├── model/
│   │   │   └── sidebar-store.ts     # zustand: expanded state (widget-owned)
│   │   └── ui/
│   │       ├── sidebar.ts/.css
│   │       └── sidebar.test.ts
│   ├── features/                   # layer — trống (.gitkeep)
│   ├── entities/toeic-catalog/      # slice: catalog entity
│   │   ├── index.ts                 # public API
│   │   ├── model/
│   │   │   ├── types.ts             # Catalog, CatalogTest, CatalogPart, ...
│   │   │   └── catalog-store.ts     # zustand/vanilla store: catalog + load status
│   │   └── api/
│   │       ├── loadCatalog.ts       # invoke("read_catalog")
│   │       ├── loadTestParts.ts     # invoke("read_content_files") — preload part JSON
│   │       └── test-parts-query.ts  # TanStack query: cached preload (5 min fresh)
│   └── shared/                      # layer: no slices
│       ├── api/
│       │   └── query-client.ts      # TanStack Query client (short-lived cache defaults)
│       ├── lib/                    # trống (.gitkeep)
│       └── ui/                     # UI kit generic (không business logic)
│           ├── icon.ts/.css        # createIcon — Iconify raw SVG (lucide set)
│           ├── button.ts/.css      # createIconButton (bordered/ghost, active)
│           └── shell.ts/.css       # app shell layout (sidebar + content)
└── src-tauri/                      # Rust shell
    ├── src/
    │   ├── main.rs                 # binary entry
    │   ├── lib.rs                  # composition root: modules, Tauri builder, command registration
    │   ├── commands/
    │   │   └── catalog.rs           # IPC adapter: read_catalog, read_content_files
    │   ├── services/
    │   │   └── catalog.rs           # catalog use cases; no Tauri or filesystem detail
    │   ├── storage/
    │   │   ├── paths.rs             # canonicalize + containment checks; colocated path-safety tests
    │   │   └── catalog_files.rs     # local catalog/content file reads; colocated tests
    │   ├── models/
    │   │   └── ipc.rs               # serializable IPC response DTOs; colocated serialization test
    │   └── error.rs                 # serializable AppError; colocated IPC error test
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

## Rust backend (`src-tauri/`)

`main.rs` is the binary entry and only calls `ownlish_lib::run()`. `lib.rs` is the composition root: it declares backend modules, configures Tauri, and registers commands.

### Dependency direction

`commands → services → storage`, with `models` and `error` shared by the layers that need them.

- `commands/`: the only Tauri IPC adapter. It resolves app-scoped dependencies and delegates work; it contains no filesystem access or business rules.
- `services/`: use-case orchestration. It accepts Rust-native dependencies (`&Path`, request data) and does not import Tauri.
- `storage/`: the only filesystem boundary. `paths.rs` owns relative-path validation, canonicalization, and root containment checks.
- `models/ipc.rs`: serializable request/response DTOs at the frontend boundary; add domain models only once Rust owns domain validation or transformations.
- `error.rs`: `AppError` keeps failure cases explicit and serializes safely across IPC.

Rust modules stay private by default; expose only `pub(crate)` items needed across these internal boundaries. Create a module only with its first real use case—no empty backend layers or speculative repository traits.

`capabilities/default.json` scopes plugin permissions, but command-side path checks remain mandatory because Rust code is the final filesystem security boundary.
