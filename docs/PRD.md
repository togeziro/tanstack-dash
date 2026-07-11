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

## Roadmap

Directional buckets, not a strict timeline. Source of truth for "what's next"
lives here; per-item task checklists live in [TODO.md](./TODO.md).

### Now

- **Production CI** — GitHub Actions running `bun run lint`, `typecheck`,
  `build`, and `db:migrate` against `tanstack_dashboard_test` on every PR.
- **Production deployment preset** — pick Vercel or Cloudflare via Nitro and
  wire `DATABASE_URL` migration runner into the deploy step.

### Next

- **Role-Based Access Control (RBAC)** — many-to-many `users → roles →
permissions` schema; JWT-embedded permissions; `requirePermission`
  middleware on every mutating server function; `useAuth().can(perm)` for UI
  hide/show. The existing `users.role` enum (`Developer`, `Designer`, ...)
  stays as a display label, untouched.
- **Magic link auth** — passwordless signin + signup via single-use tokens
  (`magic_link_tokens` table; 15-min TTL; `used_at` / `revoked_at` /
  `ip_address` / `user_agent` audit columns). Two separate server endpoints
  (`requestMagicLinkFn` for signin, `requestSignupMagicLinkFn` for signup)
  keep the flows explicit. Email transport behind a pluggable interface;
  console-log default in dev, throws in prod until a real transport is wired.

### Later

- Public API surface — once RBAC + magic link settle, expose them as
  documented stable contracts in [API.md](./API.md).
- Observability — request logs, server-fn error monitoring, Playwright
  trace archival.

### Won't (for this project)

- Social/SSO providers (Google/GitHub/etc.) — explicit opt-in deferred per
  the auth roadmap discussion. Infrastructure (the `EmailTransport` interface,
  `users.password_hash`) is provider-agnostic so wiring one later is a
  separate, contained change.
- 2FA / WebAuthn / passkeys — same reason.
- Multi-tenant isolation — single-tenant admin dashboard.

### Cross-references

- [TODO.md](./TODO.md) — task-level checklist for items above
- [FEATURES.md](./FEATURES.md) — what's currently shipped
- [CHANGELOG.md](./CHANGELOG.md) — time-ordered ship history
- [AUTH.md](./AUTH.md) — current auth architecture (email + password, JWT
  cookies, V1 and V2 login variants)
