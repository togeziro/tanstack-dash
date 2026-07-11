# Features

## Implemented

- **Dashboard Overview** — Analytics cards with Recharts graphs, Suspense-based loading
- **Product Management** — CRUD with data table (search, filter, pagination, sort, URL state)
- **User Management** — Data table with role/status filters
- **Kanban Board** — Drag-and-drop task management with priority badges, PostgreSQL-backed via Drizzle + React Query
- **Notification Center** — Bell icon badge, popover preview, full page with tabs, PostgreSQL-backed via Drizzle + React Query
- **Forms** — Basic, multi-step, sheet/dialog, and advanced patterns with TanStack Form + Zod
- **Command Palette** — Cmd+K navigation via kbar
- **Multi-Theme Support** — 10+ themes with light/dark/system switching
- **Pre-commit Hooks** — oxlint, oxfmt --check, tsc on staged files
- **Testing** — Vitest + Testing Library unit & integration tests (Drizzle schema, Zod form validation, table sorting parser, product/user/kanban data-access CRUD against a dedicated test database) plus Playwright E2E tests for product CRUD and table sorting flows
- **Authentication** — JWT cookie-based auth with sign-in/sign-up, password hashing, session management, and route protection (V1 and V2 login page variants)
- See [AUTH.md](./AUTH.md) for the current email + password auth architecture; see [PRD.md](./PRD.md#roadmap) for the RBAC + magic-link roadmap

## Planned

- **Role-Based Access Control (RBAC)** — many-to-many `users → roles → permissions` schema, JWT-embedded permissions, server-function `requirePermission` guards, `useAuth().can()` (see [TODO.md](./TODO.md) Phase 5)
- **Magic link auth** — passwordless signin + signup via single-use token emailed to user (email transport: pluggable interface; SMTP wiring deferred)
- CI/CD pipeline
