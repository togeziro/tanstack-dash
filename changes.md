# Changes vs `origin/dev`

**Status:** 1 commit ahead of remote (`1ed928a`), 0 behind.

Local `dev` branch currently contains the working dashboard state after restoring TanStack Start framework conventions (native `createServerFn`, SSR data prefetch + client hydration).

## Dependency swap (core framework fix)

- `package.json` / `bun.lock`: replaced `react-router-with-query` with `@tanstack/react-router-ssr-query@^1.167.1`.
  - Fixes the `isDehydrated` crash caused by `react-router-with-query@^1.130.17` being incompatible with `react-router@1.170.17`.
- `src/router.tsx`: added `setupRouterSsrQueryIntegration({ router, queryClient })`.

## Build / config

- `vite.config.ts`: added
  - `resolve.alias: { Buffer: 'buffer' }`
  - `define: { global: 'globalThis' }`
  - Fixes `Buffer is not defined` client crash from the `postgres` driver being bundled to the browser.

## Auth / session

- `src/lib/auth/session.ts`: rewrote to `requireSession()` using `getRequestHeaders()`; `authMiddleware` is now `.server()` only (removed `.client()` chaining that caused a TS error).
- `src/lib/db/users.ts`: pass `headers` from `getRequestHeaders()` into every `auth.api.listUsers` / `createUser` / `updateUser` / `removeUser` call.
  - Fixes the `Dynamic baseURL could not be resolved for this direct auth.api call` 500 on the users page.

## Root route / theme

- `src/routes/__root.tsx`: replaced the inline cookie read with `createServerOnlyFn` for theme loading.
  - Fixes `data-theme="[object Object]"`.

## Data pages (SSR prefetch + `ssr: 'data-only'`)

Added a `loader` using `queryClient.ensureQueryData(...)` plus `ssr: 'data-only'` to each data route so data is prefetched on the server and hydrated on the client:

- `src/routes/dashboard/product/index.tsx`
- `src/routes/dashboard/users.tsx` (also fixes a missing `usersInfoContent` import)
- `src/routes/dashboard/kanban.tsx`
- `src/routes/dashboard/notifications.tsx`
- `src/routes/dashboard/overview.tsx`

## Notifications components

- `src/features/notifications/components/notification-center.tsx`
- `src/features/notifications/components/notifications-page.tsx`
  - Fixed `data?.notifications` extraction and typed it as `NotificationItem[]` (clears TS7006 implicit-any warnings).

## Verification

- All 5 dashboard pages return HTTP 200 (`product`, `users`, `kanban`, `notifications`, `overview`).
- `bun run typecheck` — clean, no errors.
- `bun run lint` (oxlint/biome) — 0 errors.
- `bun run format` (oxfmt/biome) — applied.

## Notes / follow-ups

- Untracked junk was committed by accident: `.mimocode/.cron-lock` and two `.tanstack/tmp/*` files. These should be removed from the tree (or added to `.gitignore`) before pushing.
- Playwright sign-in was blocked by the test harness (form POST not submitted); verification used `curl` with the Better Auth `sign-in/email` endpoint + cookie, which works.
