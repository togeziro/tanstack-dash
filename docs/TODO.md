# Project Todo List

## Database Layer (Completed)

- [x] Install PostgreSQL locally (Debian 13, v17)
- [x] Create database `tanstack_dashboard` + user `tanstack`
- [x] Add `drizzle-orm`, `postgres` driver, `drizzle-kit` dev dependency
- [x] Define Drizzle schema: `products` (8 columns, pgEnum categories) and `users` (9 columns, pgEnum roles/statuses)
- [x] Generate and apply database migrations
- [x] Write seed script (`scripts/seed.ts`) — 20 products, 50 users via `@faker-js/faker`
- [x] Configure `.env` / `env.example.txt` with `DATABASE_URL`
- [x] Create server-only data-access modules (`src/lib/db/products.ts`, `src/lib/db/users.ts`)
- [x] Replace in-memory `fakeProducts`/`fakeUsers` with Drizzle queries via `createServerFn()` server-function wrappers (dynamic imports inside handlers to prevent `postgres` leaking into client bundle)
- [x] Update response types (`Product`, `User`) to match DB shapes with ISO string dates

## Quality & Build Tooling

### Core Scripts (Completed)

- [x] Add `typecheck` script (`tsc --noEmit`) to `package.json`
- [x] Add `db:generate`, `db:migrate`, `db:push`, `db:seed`, `db:studio` scripts to `package.json`

### Pre-commit Hooks (Completed)

- [x] Install `simple-git-hooks` + `lint-staged`
- [x] Configure pre-commit to run `oxlint`, `oxfmt --check`, `tsc --noEmit` on staged files
- [x] Fixed `tsconfig.json` — removed deprecated `baseUrl`, upgraded lib target to `ES2023` to unblock `tsc --noEmit`

### Testing Setup (Completed)

- [x] Install Vitest + `@testing-library` stack (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`)
- [x] Add `test`, `test:run`, `test:coverage` scripts to `package.json`
- [x] Configure Vitest (`vite.config.ts` test block, `vitest.setup.ts`, dedicated `tanstack_dashboard_test` DB via `test.env`)
- [x] Add `db:test:create` script (`scripts/create-test-db.ts`) to (re)create the isolated test database
- [x] Shared DB test helper (`src/test-utils/db.ts`) for truncation/reseed isolation
- [x] Unit tests for Drizzle schemas (products, users, kanban enums/columns/FKs)
- [x] Unit tests for Zod form validation (product & user schemas) and the table sorting parser
- [x] Integration tests for data-access layer (product/user/kanban CRUD, filtering, search, pagination, sort, kanban move ordering) against the test DB
- [x] Add browser/component E2E tests for main dashboard user flows (product CRUD, tables)

### DevTools Wiring (Completed)

- [x] `TanStackRouterDevtools` is mounted in `src/routes/__root.tsx`
- [x] `ReactQueryDevtools` mounted in `__root.tsx` (imported from `@tanstack/react-query-devtools`, already in devDeps)

## Feature Migrations (Zustand to PostgreSQL)

- [x] Migrate Kanban board drag-drop state (columns, tasks, task priority badges) to DB tables and mutations
- [x] Chat feature removed (decommissioned)
- [x] Remove dead chat leftovers after decommission: `open-chat` kbar action routes in `src/features/notifications/components/notification-center.tsx` + `notifications-page.tsx`, and `chat: IconMessage` in `src/components/icons.tsx`
- [x] Migrate Notification center (notification triggers, read/unread statuses, bell icon badge count) to DB tables and mutations

## Authentication & Authorization (Documented — see [docs/AUTH.md](./AUTH.md))

### Phase 1: Foundation (Done)

- [x] Install `bcryptjs` + `jose`
- [x] Add `password_hash` column to users schema + migration
- [x] Create auth server functions: `signInUser`, `signUpUser`, `getSession`, `signOutUser`
- [x] Create `AuthProvider` + `useAuth()` hook
- [x] Wire `AuthProvider` into root layout

### Phase 2: V1-Style Login/Register (Done)

- [x] Rewrite sign-in view with V1 split-screen layout (1/3 + 2/3)
- [x] Add password field to `UserAuthForm` with `@tanstack/react-form` + Zod
- [x] Implement actual submit handler → `signInUser` → redirect to dashboard
- [x] Rewrite sign-up view matching V1 layout
- [x] Create register form with email + password + confirm

### Phase 3: V2-Style Login/Register (Done)

- [x] Create `auth/v2/layout.tsx` — 50/50 branded split-screen
- [x] Create V2 sign-in route with centered card + top/bottom chrome
- [x] Create V2 sign-up route using V2 layout

### Phase 4: Route Protection (Done)

- [x] Add `beforeLoad` to `/dashboard` — check `getSession()`, redirect if unauthenticated

### Phase 5: Better Auth Swap (Completed — replaces Phases 1-4)

- [x] Install `better-auth`, `@better-auth/drizzle-adapter`
- [x] Generate Better Auth schema tables (user, session, account, verification)
- [x] Create auth server config with admin plugin + tanstackStartCookies
- [x] Create auth client, permissions module, API route handler
- [x] Decommission old JWT auth: delete `server.ts`, `client.tsx`, `bcryptjs`, `jose`
- [x] Rewrite sign-in/register forms to use `authClient.*` directly
- [x] Update dashboard `beforeLoad` to use Better Auth session
- [x] Drop obsolete `users` table + `user_role`/`user_status` enums
- [x] Rewrite users data-access layer for Better Auth admin API
- [x] RBAC via Better Auth `admin` plugin — roles, permissions, `createAccessControl`

## Security — RPC Boundary Hardening (Completed)

- [x] `createServerFn` endpoints now enforce a valid session at the RPC boundary (not just route `beforeLoad`): `requireSession()` on reads/mutations, `requireRole('admin')` on product/user writes (Better Auth admin API).
- [x] Every server-function input is validated with a Zod schema (`src/features/<f>/api/validation.ts`) via `@tanstack/zod-adapter`'s `zodValidator` — replacing the old type-assertion validators.
- [x] `lib/db/*.ts` wrapped in `try/catch` using a shared `mapDbError` (`src/lib/errors.ts`); intentional domain errors use `DomainError` and pass through, unexpected DB errors become a generic message.

### Open — Notifications are not owner-scoped (IDOR)

> **Notifications are not owner-scoped (IDOR).** The `notifications` table has no `user_id` column. Any authenticated user can read (`getNotifications`), mark-read (`markAsRead`), delete (`removeNotification`), or mark-all-read (`markAllAsRead`) any other user's notifications via id-guessing or the unscoped `getNotifications`/`markAllAsRead` calls. `requireSession()` closes the _unauthenticated_ gap but does **not** close this _authorization_ gap — "authenticated" is not "authorized" for per-resource ownership.
>
> Fix requires: a schema migration adding `user_id` (nullable during backfill, since seed/system notifications have no owner), threading `session.user.id` through `addNotification` call sites, and a `WHERE user_id = ?` clause on the four read/write functions. This was deliberately left out of the boundary-hardening PR so the schema/migration decision gets its own review.

### Confirmed intentional — Kanban is a shared board

> The kanban board is intentionally shared across all authenticated users; no per-user or per-board scoping exists by design (Trello-style team board). `addTask`/`moveTask` are intentionally wide-open to any authenticated user, not an oversight.

## DevOps & Deployment

- [ ] Configure CI pipeline (GitHub Actions) to run `bun run lint`, `bun run typecheck`, and `bun run build`
- [ ] Add a CI step to run `bun run db:migrate` against a test database
- [ ] Set up production Nitro presets for Vercel, Cloudflare, or self-hosted Docker/Node.js
- [ ] Configure database migration runner in deployment phase (production DATABASE_URL)
