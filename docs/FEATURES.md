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
- **Authentication** — Better Auth email + password with DB sessions, RBAC (admin plugin), route protection, and show/hide password toggle on sign-in/register forms
- See [AUTH.md](./AUTH.md) for full architecture details

## Planned

- **Magic link auth** — passwordless signin + signup via single-use token emailed to user (email transport: pluggable interface; SMTP wiring deferred)
- CI/CD pipeline
