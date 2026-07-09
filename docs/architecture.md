# Architecture

## Overview

TanStack Start meta-framework with Vite 7, React 19, and Nitro for production builds.

## Data Flow

1. Route `loader` prefetches data via server functions (`createServerFn()`)
2. Server functions use dynamic imports to access the DB layer (keeps `postgres` driver out of client bundle)
3. Client consumes data via `useSuspenseQuery` / `useQuery`
4. Mutations invalidate React Query cache for automatic refetch

## Directory Structure

```
src/
├── routes/                     # File-based routing (TanStack Router)
│   ├── __root.tsx              # Root layout (providers, theme, HTML shell)
│   └── dashboard/              # Dashboard pages
├── features/                   # Feature modules
│   ├── <name>/
│   │   ├── api/                # Types, server functions, queries, mutations
│   │   ├── components/         # Feature-specific components
│   │   └── utils/              # Feature-specific utilities & state
├── lib/
│   └── db/                     # Drizzle schema, migrations, data access
├── components/                 # Shared UI (shadcn/ui primitives)
├── hooks/                      # Custom hooks
├── config/                     # Navigation, infobar, data table config
└── styles/                     # Global CSS & theme files
```

## Key Patterns

- **Server functions**: `createServerFn()` with `import()` inside handlers
- **State management**: React Query for server state, Zustand for client-only state (chat, notifications)
- **DB access**: Server-only modules in `src/lib/db/`, never imported by client code
- **Pre-commit hooks**: simple-git-hooks + lint-staged (oxlint, oxfmt --check, tsc --noEmit)
- **Validation**: Runtime input validation on all server function endpoints
