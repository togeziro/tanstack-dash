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
- **Role-Based Access Control (RBAC)** — Auth context with role/permission checks (planned view rendering)

## Planned

- CI/CD pipeline
