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

## Authentication & Authorization

- [ ] Connect a real authentication provider (e.g., Clerk, Auth.js)
- [ ] Implement route protection using TanStack Router `beforeLoad` middleware
- [ ] Implement role-based access control (RBAC) in server functions and routing layouts

## DevOps & Deployment

- [ ] Configure CI pipeline (GitHub Actions) to run `bun run lint`, `bun run typecheck`, and `bun run build`
- [ ] Add a CI step to run `bun run db:migrate` against a test database
- [ ] Set up production Nitro presets for Vercel, Cloudflare, or self-hosted Docker/Node.js
- [ ] Configure database migration runner in deployment phase (production DATABASE_URL)
