# Product Requirements Document

## Overview

Admin dashboard starter built with TanStack Start, shadcn/ui, Tailwind CSS,
and PostgreSQL. Targets SaaS apps, internal tools, and admin panels.

## Core Requirements

1. **Data tables** — Sorting, filtering, pagination, URL state sync with TanStack Table
2. **CRUD operations** — Products, users with server-side validation via Drizzle + React Query
3. **Kanban board** — Drag-and-drop task management with PostgreSQL persistence
4. **Notification center** — Badge count, preview popover, full page view
5. **Forms** — Multi-step, validation, file upload patterns with TanStack Form
6. **Authentication** — Email/password sign-in and sign-up with JWT session management, route protection
7. **Command palette** — Quick navigation (Cmd+K) via kbar
8. **Multi-theme** — Theme switching with local storage persistence

## Technical Requirements

- TypeScript strict mode
- Server-only DB access via dynamic imports
- Automated testing (Vitest unit/integration + Playwright E2E)
- Pre-commit quality gates (lint, format, typecheck)
- PostgreSQL with Drizzle ORM
- Feature-based folder structure
