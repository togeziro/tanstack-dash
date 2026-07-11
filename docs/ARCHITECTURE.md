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
e2e/                            # Playwright end-to-end tests (helpers, specs, fixtures)
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
- **State management**: React Query for all server state (products, users, kanban, notifications)
- **DB access**: Server-only modules in `src/lib/db/`, never imported by client code
- **Pre-commit hooks**: simple-git-hooks + lint-staged (oxlint, oxfmt --check, tsc --noEmit)
- **Validation**: Runtime input validation on all server function endpoints
- **E2E testing**: Playwright tests in `e2e/` auto-start the dev server, run headless Chromium with a single worker (shared DB), and use Radix-aware interaction helpers for dropdown menus

## Authentication Flow

Auth uses **Better Auth** (DB-session based) via the `admin` plugin for RBAC. See [AUTH.md](./AUTH.md) for full details.

1. Sign-in/sign-up forms call `authClient.signIn.email` / `authClient.signUp.email` directly
2. Better Auth manages session cookies via the `tanstackStartCookies` plugin
3. API handler at `/api/auth/$` handles all Better Auth requests (GET/POST)
4. Dashboard routes use `beforeLoad` guard — calls `auth.api.getSession({ headers })`, redirects to `/auth/sign-in` if unauthenticated
5. Sign-out via `authClient.signOut()` clears the session
6. RBAC is enforced via Better Auth `admin` plugin with `createAccessControl` roles
