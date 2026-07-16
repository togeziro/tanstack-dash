# Security

The server-function boundary (`createServerFn` in `src/features/<feature>/api/service.ts`) is hardened:

- **Authentication at the boundary** — every endpoint calls `requireSession()` (or `requireRole('admin')` for product/user writes) inside the handler, so endpoints cannot be reached unauthenticated over HTTP — independent of route guards (`beforeLoad`).
- **Input validation** — every server-function input is validated at runtime with a Zod schema (`src/features/<f>/api/validation.ts`) via `@tanstack/zod-adapter`'s `zodValidator`. Schemas use `z.ZodType<ExistingType>` so they cannot drift from the request types.
- **Error mapping** — `lib/db/*.ts` wraps DB calls in `mapDbError` (`src/lib/errors.ts`); unexpected errors become a generic message (no constraint/column names leak), while intentional `DomainError`s pass through.

These guarantees hold for reads and mutations across all four features (products, users, kanban, notifications).

## Known gap — Notifications are not owner-scoped (IDOR)

> **Tracked, not yet fixed.** The `notifications` table has no `user_id` column, so any authenticated user can read (`getNotifications`), mark-read (`markAsRead`), delete (`removeNotification`), or mark-all-read (`markAllAsRead`) any other user's notifications via id-guessing or the unscoped `getNotifications`/`markAllAsRead` calls.
>
> `requireSession()` closes the _unauthenticated_ gap but does **not** close this _authorization_ gap — "authenticated" is not "authorized" for per-resource ownership.

**Required fix (deferred to its own review):**

- Schema migration adding `user_id` (nullable during backfill, since seed/system notifications have no owner).
- Thread `session.user.id` through `addNotification` call sites.
- Add a `WHERE user_id = ?` clause on the four read/write functions.

This was deliberately left out of the boundary-hardening work so the schema/migration decision gets its own review. See `docs/TODO.md`.

## Confirmed intentional — Kanban is a shared board

The kanban board is intentionally shared across all authenticated users; no per-user or per-board scoping exists by design (team-wide Trello-style board). `addTask`/`moveTask` are intentionally available to any authenticated user — this is a design choice, not an oversight.
