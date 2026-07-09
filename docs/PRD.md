# Product Requirements Document

## Overview

Admin dashboard starter built with TanStack Start, shadcn/ui, Tailwind CSS,
and PostgreSQL. Targets SaaS apps, internal tools, and admin panels.

## Core Requirements

1. **Data tables** — Sorting, filtering, pagination, URL state sync with TanStack Table
2. **CRUD operations** — Products, users with server-side validation via Drizzle + React Query
3. **Kanban board** — Drag-and-drop task management with PostgreSQL persistence
4. **Chat interface** — Messaging UI with demo auto-reply
5. **Notification center** — Badge count, preview popover, full page view
6. **Forms** — Multi-step, validation, file upload patterns with TanStack Form
7. **Command palette** — Quick navigation (Cmd+K) via kbar
8. **Multi-theme** — Theme switching with local storage persistence

## Technical Requirements

- TypeScript strict mode
- Server-only DB access via dynamic imports
- Pre-commit quality gates (lint, format, typecheck)
- PostgreSQL with Drizzle ORM
- Feature-based folder structure
