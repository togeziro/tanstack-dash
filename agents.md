# agents.md — TanStack Dashboard

## Quick start

```bash
bun install
cp env.example.txt .env
bun run db:push    # apply DB schema
bun run db:seed    # seed 20 products + 50 users
bun run dev        # http://localhost:3000
bun run build      # client + server bundles
bun run start      # run built app from .output/
```

## Commands

| Script                 | Tool                                 |
| ---------------------- | ------------------------------------ |
| `bun run lint`         | oxlint                               |
| `bun run lint:fix`     | oxlint --fix                         |
| `bun run format`       | oxfmt --write .                      |
| `bun run format:check` | oxfmt --check .                      |
| `bun run typecheck`    | tsc --noEmit                         |
| `bun run prepare`      | simple-git-hooks (install git hooks) |
| `bun run lint-staged`  | lint-staged (run on staged files)    |
| `bun run db:generate`  | drizzle-kit generate                 |
| `bun run db:migrate`   | drizzle-kit migrate                  |
| `bun run db:push`      | drizzle-kit push (dev)               |
| `bun run db:seed`      | bun run scripts/seed.ts              |
| `bun run db:studio`    | drizzle-kit studio                   |

## Architecture

- **TanStack Start** (React 19, Vite 7) — SSR handled internally via Vite environments
- **Routing**: file-based (`src/routes/`) via TanStack Router. Run dev to regenerate `src/routeTree.gen.ts` (gitignored, do not edit manually).
- **Database & Server Functions**:
  - Drizzle ORM configured with a local/dev PostgreSQL database.
  - Actual DB connection (`src/lib/db/index.ts`) and data access layers (`src/lib/db/products.ts` / `users.ts`) must never leak to the client.
  - Exposed via `createServerFn()` server functions (`src/features/<name>/api/service.ts`) using dynamic imports inside handlers.
- **Data fetching**: route `loader` + `useSuspenseQuery`. Query client lives in router context (`src/router.tsx:9`).
- **State**: React Query (products, users, kanban), Zustand (chat, notifications).

## Code conventions

- Path alias `@/` → `./src/*` (tsconfig + vite-tsconfig-paths)
- Linter: oxlint (Config in `.oxlintrc.json`).
- Formatter: oxfmt (Config in `.oxfmtrc.json` — single quotes, no trailing commas, JSX single quotes, LF).
- CSS: Tailwind v4 (`@import 'tailwindcss'` + `tw-animate-css`). Themes via CSS files in `src/styles/themes/`.
- **CSS import**: use side-effect `import '@/styles/globals.css'` — NOT `?url`. TanStack Start auto-injects CSS via dev-styles middleware.
- shadcn/ui: new-york style. Icons: `@radix-ui/react-icons`. `components.json` has all aliases.
- No `'use client'` directives — TanStack Start is not Next.js.

## Noteworthy

- Dev server port: **3000** (configured in `vite.config.ts:9`)
- **Nitro**: package is installed for production builds. Do NOT add `nitro/vite` plugin in Vite config — it conflicts with TanStack Start's dev SSR middleware. Add it only when customizing production deployment output.
- **Environment variables**: requires `DATABASE_URL` in `.env` to connect to PostgreSQL.
- Excluded from linter/formatter: `.tanstack/`, `dist/`, `build/`, `src/routeTree.gen.ts`, `scripts/`.
