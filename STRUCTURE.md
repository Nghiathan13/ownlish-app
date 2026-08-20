# design-studio — Structure

Frontend: vanilla TypeScript (no UI framework) in `src/`, Tauri 2 shell in `src-tauri/`.
Architecture: Feature-Sliced Design v2.1 (feature-sliced.design).

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
│   ├── app/                        # layer: bootstrap + global, no slices
│   │   ├── entrypoint/
│   │   │   └── main.ts             # app entry
│   │   └── styles/                 # global styles
│   │       ├── reset.css
│   │       ├── typography.css
│   │       └── global.css
│   ├── pages/                      # layer
│   │   └── workspace/              # slice: main screen
│   │       ├── index.ts            # public API
│   │       └── ui/                 # page shell: canvas + control panels
│   │           ├── workspace.ts
│   │           └── workspace.css
│   ├── widgets/                    # layer
│   │   └── block-canvas/           # slice: block pattern canvas
│   │       ├── index.ts            # public API
│   │       └── ui/                 # render + selection
│   │           ├── canvas.ts
│   │           └── canvas.css
│   ├── features/                   # layer
│   │   ├── color-picker/           # slice: color token editor
│   │   │   ├── index.ts            # public API
│   │   │   ├── ui/                 # control DOM + css
│   │   │   └── model/              # interaction state
│   │   ├── size-control/           # slice: size/spacing token editor
│   │   │   ├── index.ts
│   │   │   ├── ui/
│   │   │   └── model/
│   │   └── radius-control/         # slice: radius token editor
│   │       ├── index.ts
│   │       ├── ui/
│   │       └── model/
│   ├── entities/                   # layer
│   │   ├── token/                  # slice: design token
│   │   │   ├── index.ts            # public API
│   │   │   └── model/              # types, defaults, store, CSS var sync
│   │   └── pattern/                # slice: block/pattern model
│   │       ├── index.ts
│   │       └── model/              # block tree model
│   └── shared/                     # layer: no slices
│       ├── lib/                    # focused utils: color, dom, storage
│       └── ui/                     # UI kit: base primitives, no business logic
└── src-tauri/                      # Rust shell
    ├── src/
    │   ├── main.rs                 # binary entry
    │   └── lib.rs                  # Tauri builder (no commands yet)
    ├── capabilities/default.json   # window permissions
    ├── tauri.conf.json             # window, CSP, bundle
    ├── Cargo.toml
    └── icons/                      # app icons
```

Note: `app/`, `pages/`, `widgets/`, `features/`, `entities/` are the target layout (to be built); current `src/main.ts` → `app/entrypoint/main.ts`, `src/styles.css` → `app/styles/`.

## Layer rules

- Dependency direction is one-way: app → pages → widgets → features → entities → shared
- A module imports only from layers strictly below
- Slices on the same layer cannot import each other
- Code outside a slice imports it only via its public API (`index.ts`)
- `app/` and `shared/` have no slices; their segments import each other freely

## Naming

- Layers: fixed FSD names (app, pages, widgets, features, entities, shared)
- Slices: business domain, kebab-case (`color-picker`)
- Segments: standard names `ui`, `model`, `lib`, `api`, `config` — purpose, not essence (no `components`, `hooks`, `types`)
- Files: kebab-case; CSS one file per module, BEM `block__element--modifier`; TS PascalCase types/classes, camelCase functions

## Rust (`src-tauri/`)

- `main.rs`: binary entry, calls `lib::run()`
- `lib.rs`: `tauri::Builder` — empty for now; project save/load commands added here when needed
- `capabilities/default.json`: `core:default` only
