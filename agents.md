# agents.md — TanStack Dashboard

## Quick start
```bash
bun install
cp env.example.txt .env
bun run dev        # http://localhost:3000
bun run build      # client + server bundles
bun run start      # run built app from .output/
```

## Commands
| Script | Tool |
|--------|------|
| `bun run lint` | oxlint |
| `bun run lint:fix` | oxlint --fix |
| `bun run format` | oxfmt --write . |
| `bun run format:check` | oxfmt --check . |

No test framework, no typecheck script, no CI.

## Architecture
- **TanStack Start** (React 19, Vite 7) — SSR handled internally via Vite environments
- **Routing**: file-based (`src/routes/`) via TanStack Router. Run dev to regenerate `src/routeTree.gen.ts` (gitignored, do not edit manually).
- **Data fetching**: route `loader` + `useSuspenseQuery`. Query client lives in router context (`src/router.tsx:9`).
- **Server functions**: `createServerFn()` in route files (see `__root.tsx:18` for example).
- **Feature modules**: `src/features/<name>/` — route components import from here; `src/constants/` holds mock data.
- **State**: Zustand (kanban), TanStack Query (server state).

## Code conventions
- Path alias `@/` → `./src/*` (tsconfig + vite-tsconfig-paths)
- Linter: oxlint (NOT eslint). Config in `.oxlintrc.json`.
- Formatter: oxfmt (NOT prettier). Config in `.oxfmtrc.json` — single quotes, no trailing commas, JSX single quotes, LF.
- CSS: Tailwind v4 (`@import 'tailwindcss'` + `tw-animate-css`). Themes via CSS files in `src/styles/themes/`.
- **CSS import**: use side-effect `import '@/styles/globals.css'` — NOT `?url`. TanStack Start auto-injects CSS via dev-styles middleware.
- shadcn/ui: new-york style. Icons: `@radix-ui/react-icons`. `components.json` has all aliases.
- No `'use client'` directives — TanStack Start is not Next.js.

## Noteworthy
- Dev server port: **3000** (configured in `vite.config.ts:9`)
- **Nitro**: package is installed for production builds. Do NOT add `nitro/vite` plugin in Vite config — it conflicts with TanStack Start's dev SSR middleware (causes `env.mjs` 404 and dev worker errors). Add it only when customizing production deployment output.
- No env vars needed for local development.
- Excluded from linter/formatter: `.tanstack/`, `dist/`, `build/`, `src/routeTree.gen.ts`.
