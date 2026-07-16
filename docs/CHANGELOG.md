# Changelog

## Unreleased

### Changed

- **Codebase cleanup (spaghetti reduction)**: Applied a 10-task refactor across 4 passes (see `docs/superpowers/specs/2026-07-16-spaghetti-cleanup-design.md` and `docs/superpowers/plans/2026-07-16-spaghetti-cleanup.md`):
  - Extracted shared `AuthShell` (v1 sign-in/sign-up) and `AuthCard` (v2 routes) — removed ~4 duplicated auth layouts.
  - Deduplicated product Zod schema + category options into the canonical `features/products` sources; fixed a latent lowercase-vs-uppercase category enum bug in the demo forms; dropped an `as any` cast.
  - Relocated `fetchGitHubRepo`/`formatCount` to `lib/github.ts` and `GitHubIcon` to `icons.tsx`.
  - Removed dead `useEffect` in `app-sidebar.tsx`; extracted shared `FilterClearButton` from 3 table-filter components; extracted `PasswordField` from auth forms; extracted `parseFilterValuesFromSearch`/`buildFilterSearchParams` from `use-data-table.ts` into `lib/parsers.ts`; split the 755-line `infobar.tsx` into 5 cohesive modules; extracted `ComboboxField`/`TagsField`/`SectionTitle` from `demo-form.tsx`; added `getProductOr404` helper to dedupe the load-row preamble in `db/products.ts`.

- **Auth**: Swapped custom JWT (`bcryptjs`, `jose`) for Better Auth.
  - Added `better-auth` + `@better-auth/drizzle-adapter` deps; removed `bcryptjs`, `jose`, `@types/bcryptjs`.
  - Generated Better Auth schema tables (`user`, `session`, `account`, `verification`).
  - New auth server config with `admin` plugin + `tanstackStartCookies`.
  - New auth client, permissions module, `/api/auth/$` route handler.
  - Deleted old `src/lib/auth/server.ts` and `src/lib/auth/client.tsx` (AuthProvider/useAuth).
  - Sign-in/register forms now call `authClient.*` directly.
  - Dashboard `beforeLoad` uses Better Auth session via `ensureSession`.
  - Dropped old `users` table + `user_role`/`user_status` enums (migrations 0005–0006).
  - Users data-access layer rewritten to use Better Auth admin API.
  - Seed script no longer seeds users.
  - Password fields on sign-in and register forms now have a show/hide eye toggle.

### Added

- Seeded a demo admin account `admin@example.com` / `Password123!` via `scripts/seed.ts` (`seedUsers`), so login can be tested immediately after `db:seed` (idempotent — skips if the email already exists).

### Fixed

- **Login 404/403** — Better Auth endpoints are multi-segment, so the API handler must be a catch-all splat route (`src/routes/api/auth/$.ts`); patched TanStack Start's `createStartHandler.js` so `server.handlers` fire on splat routes, with `scripts/postinstall.js` re-applying the patch after `bun install`.
- **Better Auth "Invalid origin" 403** — `baseURL` now uses a dynamic `allowedHosts` + `protocol: 'auto'` config (replaces the hardcoded `http://localhost:3000`) so Caddy-served dev hosts pass the CSRF origin check.
- **SSR restore (framework realignment)** — replaced the deprecated `@tanstack/react-router-with-query` (`v1.130.17`, incompatible with Router `v1.170.17`) with the official `@tanstack/react-router-ssr-query` (`v1.167.1`) and wired `setupRouterSsrQueryIntegration({ router, queryClient })` in `src/router.tsx`. Fixes the `isDehydrated` crash during SSR streaming.
- **`Buffer is not defined` client crash** — the `postgres` driver was reaching the browser bundle; `vite.config.ts` now aliases `Buffer → 'buffer'` and defines `global → globalThis`.
- **`data-theme="[object Object]"`** — `__root.tsx` loader now reads the active theme via `createServerOnlyFn` (imports `@tanstack/react-start/server` server-side only).
- **Users page 500** — `getUsers`/`createUser`/`updateUser`/`deleteUser` now pass `getRequestHeaders()` into every `auth.api.*` admin call, fixing `Dynamic baseURL could not be resolved`.
- **Notifications `filter is not a function`** — components now read `data?.notifications` (the query returns `NotificationsResponse`, not a bare array) and type it as `NotificationItem[]`.
- **Auth middleware TS error** — `authMiddleware` is now `.server()`-only (removed the `.client()` chain).
- **Data routes** — `product`, `users`, `kanban`, `notifications`, `overview` now use a `loader` that calls `queryClient.ensureQueryData(...)` with `ssr: 'data-only'`, so data prefetches on the server and hydrates on the client.

All changes above are committed on `dev` (HEAD `1ed928a`).

All notable changes to this project will be documented in this file.

## [0.1.0]

### Added

- JWT cookie-based auth with `bcryptjs` password hashing — server functions (`signInUserFn`, `signUpUserFn`, `getSessionFn`, `signOutUserFn`), `AuthProvider`/`useAuth()` context, `beforeLoad` route protection on `/dashboard`
- V1-style auth pages — 1/3 + 2/3 split-screen layout for sign-in and sign-up (replaces old placeholder pages)
- V2-style auth pages — 50/50 branded split-screen with centered card form at `/auth/v2/sign-in` and `/auth/v2/sign-up`
- Password field + "Remember me" checkbox in login form with `@tanstack/react-form` + Zod
- Register form with first/last name, email, password + confirm (Zod `.refine()` validation)
- `password_hash` column added to `users` table (migration `0004_flowery_steel_serpent`)
- Auth architecture docs — see [docs/AUTH.md](./AUTH.md)

### Fixed

- Empty `AUTH_SECRET` now throws on startup instead of signing tokens with an empty key
- Auth handler bodies wrapped in try/catch — safe error logging, no stack leaks to client
- Signup TOCTOU race removed — catches PostgreSQL unique constraint violation instead of pre-check
- Email now lowercased/trimmed on both signup and signin for case-insensitive login
- "Remember me" checkbox now controls cookie `maxAge` (1 day unchecked, 30 days checked)
- `payload.sub` guarded — JWT without `sub` returns null session instead of crashing
- `serializeUser` types simplified to avoid Drizzle `PgColumn` type leaking into client

### Added

- PostgreSQL database layer with Drizzle ORM (products, users, kanban tables)
- Server-only data-access modules with dynamic imports
- Seed script for products (20), users (50), kanban board (4 columns, 10 tasks)
- Pre-commit hooks via simple-git-hooks + lint-staged (oxlint, oxfmt --check, tsc)
- React Query DevTools in root layout
- Kanban board migration from Zustand to PostgreSQL (schema, server functions, React Query)
- Input validation on kanban server functions
- FK constraint on kanban_tasks.column_slug
- Form reset and empty-title validation in new task dialog
- Race condition protection on kanban drag-drop mutations
- Cleanup of debounce timers on component unmount
- Testing setup: Vitest + Testing Library unit & integration tests for schemas, form validation, table parser, and product/user/kanban data-access against dedicated test DB
- `vite.config.ts` test configuration (test block, vitest.setup.ts with test DB env)
- `scripts/create-test-db.ts` and `src/test-utils/db.ts` helper for test isolation
- Added test scripts: `test`, `test:run`, `test:coverage`
- Playwright E2E tests (`e2e/`) for product CRUD (create/update/delete) and table sorting, plus `e2e` and `e2e:install` scripts and `playwright.config.ts` (auto-starts dev server, single worker to avoid DB races)

### Changed

- Removed deprecated `baseUrl` from tsconfig.json
- Upgraded lib target to ES2023

### Fixed

- Stale closure in kanban store (dbColumns captured via ref)
- Optimistic state not clearing on mutation error
- Null check on addTask database result
- Input validation in `getProducts`: page/limit clamped to safe ranges, categories filter normalized via `Array.isArray` + enum filtering, replacing `String()` garbage coercion
- Input validation in `createProduct`/`updateProduct`: `validateCategory()` guard replaces unsafe `as ProductCategory` cast; `validatePrice()` guard prevents null/NaN from reaching DB as `"null"`/`"NaN"` strings

### Removed

- Chat feature (routes, components, nav entry, notification mock) — decommissioned
- Dead chat leftovers: `open-chat` actionRoutes in notification center, `chat: IconMessage` icon alias, `IconMessage` import
- Zustand dependency — last consumer (notification center mock store) replaced with PostgreSQL + React Query

### Added

- Notification Drizzle schema (`notification_status` enum, `notifications` table with JSONB actions)
- Notification data-access layer (`src/lib/db/notifications.ts`)
- Notification server functions (`createServerFn`) — `getNotificationsFn`, `markAsReadFn`, `markAllAsReadFn`, `addNotificationFn`, `removeNotificationFn`
- Notification React Query keys, query options, and mutation options
- Notification integration tests (7 tests covering CRUD, status updates)
- Notification seed data (8 entries in `scripts/seed.ts`)
- DB migration `0003_cheerful_rumiko_fujikawa` (notifications table)
- `drizzle.config.ts` now uses explicit schema file list (avoids picking up `.test.ts` files)

### Changed

- Notification center components (`notification-center.tsx`, `notifications-page.tsx`): swapped Zustand store for `useQuery` + `useMutation`
- Deleted `src/features/notifications/utils/store.ts` (Zustand mock store) — no longer needed
