# Session Learnings — Jul 2026

All .md files renamed to lowercase throughout project.

## TanStack Package Updates

Updated 8 packages via `bun update`:
- react-query: 5.95.2 → **5.101.2**
- react-router: 1.141.1 → **1.170.17**
- react-start: 1.141.1 → **1.168.27**
- react-form: 1.28.5 → **1.33.0**
- router-plugin: 1.141.1 → **1.168.19**
- zod-adapter: 1.141.1 → **1.167.0**
- react-router-devtools: 1.141.1 → **1.167.0**
- react-query-devtools: 5.95.2 → **5.101.2**

No breaking changes — all minor/patch bumps.

## Nitro Plugin Conflict (`env.mjs` 404)

**Do NOT add `nitro/vite` plugin in Vite config for dev mode.** It creates a Nitro dev worker that conflicts with TanStack Start's built-in SSR middleware. This causes:
- `/node_modules/vite/dist/client/env.mjs` 404 (Vite 7 resolves `@vite/env` to this file path)
- Nitro dev worker errors loading TanStack Start entry files

**Fix**: Remove `nitro()` from Vite plugins. Keep `nitro` package in `package.json` for production builds.

## CSS Import Pattern (globals.css 404)

Use **side-effect imports** (not `?url`):
```tsx
// CORRECT — TanStack Start auto-injects CSS
import '@/styles/globals.css';

// WRONG — bypasses CSS collection system, causes 404
import appCss from '@/styles/globals.css?url';
```

Side-effect imports are discovered from the client build and injected via `@tanstack-start/styles.css` dev-styles middleware.

## Vite 7 Observations

- Sets `appType: "custom"` (TanStack Start) — disables HTML fallback middleware
- Multi-environment setup: separate client/server environments
- `@vite/env` resolved to file path `/node_modules/vite/dist/client/env.mjs` (not virtual `/@vite/env`)
- File is served correctly without Nitro plugin interfering

## Config Changes

| File | Change |
|---|---|
| `vite.config.ts` | Removed `nitro/vite` plugin, custom middleware, `fs.allow` — now clean 6-line config |
| `package.json` | Reverted `start` to `node .output/server/index.mjs` |
| `src/routes/__root.tsx` | Changed CSS import from `?url` to side-effect |
| `docs/stack.md` | Updated TanStack versions, removed Vercel, added Nitro warning |
| Various `.md` → `.md` | Renamed to lowercase: `AGENTS.md`, `README.md`, `STACK.MD`, etc. |
