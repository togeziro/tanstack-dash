# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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

### Removed

- Chat feature (routes, components, nav entry, notification mock) — decommissioned
