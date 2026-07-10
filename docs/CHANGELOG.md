# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
