# ownlish — Structure

Frontend: vanilla TypeScript (no UI framework) in `src/`, Tauri 2 shell in `src-tauri/`.
Architecture: Feature-Sliced Design v2.1 (feature-sliced.design).

## Directory tree (skeleton hiện tại — thật)

```
ownlish/
├── index.html                      # entry HTML, mounts #app
├── package.json                    # deps + scripts
├── pnpm-workspace.yaml             # pnpm 11 config (allowBuilds)
├── tsconfig.json
├── vite.config.ts                  # dev server, port 1420
├── README.md
├── STRUCTURE.md                    # this file
├── src/                            # frontend
│   ├── app/                        # layer: bootstrap + global, no slices
│   │   ├── entrypoint/
│   │   │   └── main.ts             # app entry (thin: mount root + start router)
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
│   │       ├── tests-overview.ts    # màn 1: load catalog + card grid
│   │       ├── tests-overview.css
│   │       ├── tests-study.ts       # màn 2: preload part JSON (chưa render)
│   │       ├── tests-study.css
│   │       ├── test-card.ts         # card — ở page tới khi có consumer thứ 2
│   │       └── test-card.css
│   ├── widgets/                    # layer — trống (.gitkeep)
│   ├── features/                   # layer — trống (.gitkeep)
│   ├── entities/toeic-catalog/      # slice: catalog entity
│   │   ├── index.ts                 # public API
│   │   ├── model/
│   │   │   └── types.ts             # Catalog, CatalogTest, CatalogPart, ...
│   │   └── api/
│   │       ├── loadCatalog.ts       # invoke("read_catalog")
│   │       └── loadTestParts.ts     # invoke("read_content_files") — preload part JSON
│   └── shared/                      # layer: no slices
│       ├── lib/                    # trống (.gitkeep)
│       └── ui/                     # trống (.gitkeep)
└── src-tauri/                      # Rust shell
    ├── src/
    │   ├── main.rs                 # binary entry
    │   └── lib.rs                  # Tauri builder (no commands yet)
    ├── capabilities/default.json   # window permissions
    ├── tauri.conf.json             # window, CSP, bundle
    ├── Cargo.toml
    └── icons/                      # app icons
```

## Cấu trúc mẫu (ví dụ — KHÔNG tạo sẵn)

Slice tên thật (theo business domain) chỉ được tạo tăng dần, mỗi lần một slice, sau khi research.
Tên `example` dưới đây chỉ là mẫu generic — không overfit vào bất kỳ app cụ thể nào.

```
ownlish/
├── pages/example/                  # slice mẫu: 1 màn hình
│   ├── index.ts                    # public API
│   └── ui/
│       ├── example.ts
│       └── example.css
├── widgets/example/                # slice mẫu: block tự đứng, tái dùng giữa pages
│   ├── index.ts
│   └── ui/
├── features/example/               # slice mẫu: 1 tương tác người dùng
│   ├── index.ts
│   ├── ui/
│   └── model/
├── entities/example/               # slice mẫu: 1 business entity
│   ├── index.ts
│   ├── model/                      # types, state, logic thuần
│   └── ui/
└── shared/                         # layer: no slices
    ├── lib/                        # utils thuần, không business logic
    └── ui/                         # UI kit dùng chung, không business logic
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
- `lib.rs`: `tauri::Builder` — empty for now; app commands added here when needed
- `capabilities/default.json`: `core:default` only
