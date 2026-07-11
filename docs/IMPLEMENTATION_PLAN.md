# Implementation Plan — Full-Stack Completion

**Status:** Build mode · All 12 O-items + 16 Q + 26 R2-Q LOCKED · Overlap/over-engineering review APPLIED (A1 Pacer-wins, A2.B keep-devtools+note, B1.B bitnami/pgbouncer, B2.B drop-global-limiter, B3.B skip-dev-override, D1.B in-process-worker) · **Plan-doc scrub applied (Section 6): resolved PA-1…PA-11 self-contradictions + B omissions (PB-1…PB-12) + C deletion lock (1…12) + D overlap (PD-1…PD-7); 5 new subsections (5.2c, 5.8, 5.9, 5.10, 5.11); open-items 9/10/11 folded into plan (§6.8 register tracks 1–11)** · Doc-only, NO code/infra/Docker/CI files created — awaiting explicit "go"
**Scope (per user choice a):** Single consolidated plan covering all 4 gap areas.
**Source of truth gaps:** README/AGENTS/FEATURES/PRD/TODO/ARCHITECTURE/API/CHANGELOG/STACK/AUTH.

> ✅ **All decisions locked.** Pre-plan Q&A (10 items) + follow-up open items (12 items)
> resolved via user answers. No further confirmation needed before coding.

| # | Question | Assumed default |
|---|----------|-----------------|
| 1 | Better Auth migration style | **Full swap + decommission all wrappers (no shims)**. Confirmed via context7: Better Auth natively covers `signIn`/`signUp`/`signOut`/`useSession`/`getSession`/`beforeLoad` guard, plus `admin` (RBAC) + `magicLink` plugins. Wrapper server fns and `AuthProvider`/`useAuth()` are **deleted**, not kept as compat shims |
| 2 | `users.role` enum vs RBAC | **DROP `users.role` entirely** (user choice O8=B); use Better Auth `user.role` as single source of truth. Users-page role filter/form migrates to Better Auth `user` table in P2/P3 |
| 3 | Schema ownership | **Separate `auth-schema.ts`** merged into `drizzle.config.ts` schema list |
| 4 | Database | **Postgres 17** stays (no switch) |
| 5 | cPanel SMTP | username/password, **port 587 STARTTLS**, fixed `MAIL_FROM`, **console in dev / smtp in prod** via `EMAIL_TRANSPORT` env |
| 6 | Docker image | **`oven/bun:1`** base; Nitro **`bun` preset** (matches bun runtime); **entrypoint runs `db:migrate` then `bun run .output/server/index.mjs`**; **Caddy** reverse proxy; **dockerized `postgres:17`** in compose |
| 7 | CI/CD | GH Actions: PR = lint+typecheck+test; push `main` = +build+push GHCR; test job uses ephemeral Postgres; VPS pulls via SSH action |
| 8 | Sentry | **Both frontend + server**; source maps uploaded |
| 9 | Non-goals | Keep V1+V2 auth pages, Drizzle, Router, React Query, Form; Sentry/public-API/multitenant stay "Later" |
| 10 | Plan shape | **(a)** single complete plan |

---

## Section 1 — Infrastructure & CI/CD Foundation

### 1.1 Nitro preset — ✅ ALREADY DONE (no action)
- `vite.config.ts:14` already gates `nitro({ preset: 'bun' })` on `NODE_ENV==='production'` so dev keeps TanStack Start SSR (`nitro/vite` plugin conflicts with SSR middleware in dev).
- `package.json:13` `start` script already runs `bun run .output/server/index.mjs`, matching the `oven/bun:1` base image (which has **no `node`** runtime — see PA-10 entrypoint reconciliation).
- Nothing to implement here; this line is recorded only to show the gap is closed.

### 1.2 Docker
- `Dockerfile` (multi-stage, `oven/bun:1`):
  - deps stage: `bun install --frozen-lockfile`
  - build stage: `bun run build`
  - runtime: copy `.output/`, `entrypoint.sh`, run as non-root.
- `entrypoint.sh`: wait for `pg_isready` → run `bun run db:migrate:direct` (uses `DATABASE_URL_DIRECT`, bypasses pgbouncer) → `exec bun run .output/server/index.mjs`.

> **PA-10 — entrypoint reconciliation + `oven/bun:1` runtime note.** The
> `oven/bun:1` image has **no `node`** binary, so `exec node ...` would
> fail. Use `exec bun run .output/server/index.mjs` everywhere (matches
> `package.json:13`). Also: migrations go through `DATABASE_URL_DIRECT`,
> never the pgbouncer connection (transaction mode breaks multi-statement
> migrations — see 5.6.6). This supersedes the bare `db:migrate && exec node`
> snippet that appeared earlier in §1.2.
- `docker-compose.yml` on VPS:
  - `app` service (pulled `ghcr.io/<owner>/<repo>:<tag>`), depends_on `db`, env from `.env`.
  - `db` service (`postgres:17`), named volume, healthcheck.
  - (Optional) `caddy` service for TLS + reverse proxy to `app:3000`.
- **Item 11 (ignore-file hygiene, applied):** add to `.gitignore` **and**
  `.dockerignore` (R2-Q22 already lists a base set — extend it):
  - `dist/` (TanStack Start client build output)
  - `.output/` (Nitro server bundle — built inside image, never copied from host)
  - `test-results/` (Playwright artifacts)
  - `graphify-out/` (knowledge-graph artifacts, not deployable)
  - keep `bun.lock` + `drizzle` migrations; exclude `node_modules`, `.git`.
  These four dirs are currently present in the working tree and would otherwise
  bloat the image context / get committed.

### 1.3 GitHub Actions (Option A)
- `.github/workflows/ci.yml` (PR + main):
  - `setup-node`/`oven/action-setup-bun` + cache.
  - `lint` (`oxlint`), `typecheck` (`tsc --noEmit`), `test:run` + `e2e` against service-container Postgres (`db:test:create`, `db:migrate`).
- `.github/workflows/release.yml` (push `main`):
  - reuse test job, then `docker/build-push-action` → `ghcr.io/...`, tags `sha-<short>` + `latest`, layer cache.
- `.github/workflows/deploy.yml` (push `main`, after release):
  - `appleboy/ssh-action` → `docker compose pull && docker compose up -d`.

### 1.4 VPS deploy contract
- VPS only: `docker compose pull` + run migrations via entrypoint + serve.
- Secrets: `DATABASE_URL`, `AUTH_SECRET`, `MAIL_*` in VPS `.env` (never in image).

---

## Section 2 — Authentication & Security (Better Auth)

### 2.1 Dependencies
- Add: `better-auth`, `@better-auth/drizzle-adapter`, `@better-auth/cli`.
- Remove (consolidated — **P3 only**, after the client swap lands): `bcryptjs`, `jose`, `@types/bcryptjs`. See P3 row; do **not** remove during P2 (PA-6).

### 2.2 Auth schema (Section 1 Q3)
- Generate `src/lib/db/auth-schema.ts` via `@better-auth/cli generate` (tables: `user`, `session`, `account`, `verification`).
- Register in `drizzle.config.ts` schema list alongside existing schema files.

### 2.3 Server config
- `src/lib/auth/server.ts`: `betterAuth({ baseURL, secret: AUTH_SECRET, database: drizzleAdapter(db), emailAndPassword: {...}, plugins: [bearer(), openAPI()] })`.
- Expose typed server client + Better Auth handler.

### 2.4 Plugins (solves gaps 2, 3)
- `admin` / `organization` plugin → **RBAC** (`role`/`permission` tables); `requirePermission` style guards via Better Auth middleware in server functions.
- `magicLink` plugin → **token generation + TTL** out of the box.

### 2.5 Client integration — FULL SWAP, DECOMMISSION WRAPPERS (no shims)

Verified against Better Auth docs (context7): every current wrapper is natively covered.
Delete, do not wrap.

| Current code | Better Auth native replacement |
|---|---|
| `signInUserFn` (server fn) | `authClient.signIn.email({ email, password })` |
| `signUpUserFn` (server fn) | `authClient.signUp.email({ email, password, ... })` |
| `signOutUserFn` (server fn) | `authClient.signOut()` |
| `getSessionFn` (server fn) | `authClient.useSession()` (client) / `auth.api.getSession({ headers })` (server) |
| `AuthProvider` + `useAuth()` context | `authClient.useSession()` — global nanostore-backed hook, no provider needed |
| Dashboard `beforeLoad` guard | `auth.api.getSession({ headers: ctx.request.headers })` from loader |

**Decommission (delete entirely):**
- `src/lib/auth/server.ts` (`signInUserFn`, `signUpUserFn`, `getSessionFn`, `signOutUserFn`)
- `src/lib/auth/client.tsx` (`AuthProvider`, `useAuth()`)
- `password_hash` column on `users` + migration `000X_drop_users.sql` (drops `users` table, `user_role`, `user_status` — see PA-3/PA-5)
- Deps `bcryptjs`, `jose`, `@types/bcryptjs` — **removed in P3 only** (after the client swap lands), not in P2 (consolidated with PA-6)

> **PA-2 note — `signOutUserFn` is already dead code.** No UI consumer calls it:
> `app-sidebar.tsx:152-155` "Sign out" is a hardcoded `<DropdownMenuItem>` (no `onClick`),
> and `user-nav.tsx` is entirely stubbed (not even mounted in `header.tsx`). The
> `useAuth().signOut` export inside `client.tsx` is therefore unreachable. Deleting
> `client.tsx` wholesale during P3 is safe; the sidebar "Sign out" item gets wired to
> `authClient.signOut()` in the same PR (see Phase 4 UI edits).

**New files:**
- `src/lib/auth/auth.ts` — single `betterAuth({...})` server instance + `tanstackStartCookies()` plugin
- `src/lib/auth/auth-client.ts` — `createAuthClient()` from `better-auth/react`, exporting `signIn`, `signUp`, `signOut`, `useSession`
- `src/lib/auth/permissions.ts` — `createAccessControl` (`ac`) + roles for `admin` plugin
- `src/routes/api/auth/$.tsx` — Better Auth catch-all handler route

**UI changes (form internals only, layouts untouched):**
- `UserAuthForm` / V2 sign-in → `authClient.signIn.email({...})`; `useAuth()` reads → `useSession()`
- `RegisterForm` → `authClient.signUp.email({...})`
- Dashboard `beforeLoad` → `auth.api.getSession({ headers })`

**Cookie handling:** `tanstackStartCookies()` plugin auto-sets Better Auth cookies in
TanStack Start — no manual cookie propagation code needed (replaces the hand-rolled
`auth_token` HTTP-only cookie logic).

### 2.6 `users` table — FULLY OBSOLETE (resolves Q2/O8 + status follow-up)

> **Superseded.** Original plan kept `users.role` as a display label. Per the
> locked decision below, the **entire `users` table is dropped** (both `role`
> AND `status` columns). Better Auth's `user` table (with `role` from the
> `admin` plugin) becomes the single source of truth; `banned` / profile
> `metadata` replaces the old `status` enum semantics.

- `users.role` → Better Auth `user.role` (admin plugin).
- `users.status` (`Active`/`Inactive`/`Invited`) → Better Auth `banned` flag + optional profile `metadata.status`. The Users-page status badge/form field is **removed** in the same PR (no parity table kept).
- `signUpUserFn` inserts into `users` today → replaced by Better Auth `signUp.email` which owns the `user` table.
- Migration: `000X_drop_users.sql` → `DROP TABLE users; DROP TYPE user_role; DROP TYPE user_status;`
- Downstream read-path re-point (all in P-Auth-Users, see §5.8):
  `src/lib/db/users.ts`, `src/features/users/api/{queries,mutations,service,types}.ts`,
  `src/features/users/schemas/user.ts`,
  `src/features/users/components/users-table/{columns,options,index}.tsx`,
  `src/features/users/components/user-form-sheet.tsx`,
  `src/features/users/components/user-listing.tsx`,
  `scripts/seed.ts` (`seedUsers` removed; seeded via Better Auth instead).

### 2.7 Cookie hardening (refined per O10-B / locked decision)
- Better Auth auto-enforces `secure`/`httpOnly`/`sameSite` on production HTTPS.
- **`__Host-` prefix applies to the `auth_token` cookie ONLY**, gated on
  `NODE_ENV==='production'`. Browsers reject `__Host-` over plain HTTP,
  so dev (`bun dev`) keeps the unprefixed name. Configure via Better Auth
  `advanced.cookiePrefix` / session `cookieCache` + a prod-only env switch.
- **`active_theme` cookie is explicitly OUT of scope** for `__Host-` — it is
  set client-side (`active-theme.tsx:7-11`) and stays plain. Documented as
  a deliberate exception in §5.9. (Earlier draft line 115 said "deferred";
  that is superseded by this O10-B refinement — PA-4 resolved.)

---

## Section 3 — Email Transport (cPanel SMTP via Nodemailer)

### 3.1 Adapter
- `src/lib/email/transport.ts`: `EmailTransport` interface (matches AUTH.md roadmap).
- `NodemailerSmtpTransport`: cPanel via `nodemailer` (`host`, `port 587`, `secure:false`, `STARTTLS`, `user`/`pass`, `MAIL_FROM`).
- `ConsoleTransport`: dev fallback (console-logs magic-link URL).

### 3.2 Wiring
- `EMAIL_TRANSPORT=console|smtp` env. Prod = `smtp`.
- Plug `sendVerificationEmail`/`sendMagicLink` from Better Auth magicLink plugin → Nodemailer transport.
- `.env` additions: `MAIL_HOST`, `MAIL_PORT=587`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`.

---

## Section 4 — Scalability & Monitoring Roadmap

### 4.1 Sentry (selected tool)
- Add `@sentry/bun` (server fn capture) + `@sentry/react` (client) + `@sentry/vite-plugin` (source maps).
- Init in `__root.tsx` (client) and server entry (Node).
- Upload source maps in `release.yml`.
- Documented as "Later" milestone in PRD/ARCHITECTURE.

### 4.2 Docs to update (no over-engineering now)
- `PRD.md` "Later": add Sentry, public API stabilization, multi-tenant (still won't).
- `ARCHITECTURE.md`: add Better Auth + Docker + CI section.
- `AUTH.md`: rewrite to Better Auth model; mark RBAC/magic-link as **implemented via plugins**.
- `STACK.md`: add `better-auth`, `nodemailer`, `@sentry/*`; remove `bcryptjs`/`jose`.
- `FEATURES.md`: mark RBAC + magic-link moved from Planned → Implemented.
- `TODO.md`: close Phase 5; add CI/Docker section as completed.

---

## Phased execution order

| Phase | Work | Output |
|-------|------|--------|
| P0 | Infra: Dockerfile, compose, entrypoint (+ `.gitignore`/`.dockerignore` hygiene, §6.8) | Runnable image locally |
| P1 | CI: `ci.yml` (lint/typecheck/test + test-DB) | Green PR gate |
| P2 | Better Auth foundation: deps, `auth-schema.ts`, server config, `admin` + `magicLink` plugins, `/api/auth/$` handler | Auth works via Better Auth |
| **P3** | **Auth cutover (merged):** decommission `AuthProvider`/`useAuth()`/wrapper server fns + drop `bcryptjs`/`jose`/`password_hash` **AND** drop the entire `users` table (role + status) — see §6.4 P-Auth-Users map. UI forms + sidebar + `dashboard.tsx` `beforeLoad` repoint to `authClient`/`auth.api`. | Full swap + `users` obsoleted |
| P4 | Email: Nodemailer cPanel adapter + dev console fallback | Magic links send |
| P5 | Release + deploy: `release.yml`, `deploy.yml`, GHCR, VPS pull | Live on VPS |
| P6 | Sentry + docs sync | Observability + accurate docs |

> **Item 9 (phase-consolidation, applied):** the client cutover (old P3) and the
> `users`-table migration (§6.4 "P-Auth-Users") are the **same phase** — both
> are triggered by removing `useAuth` + dropping `users`. They are merged into
> the single **P3** row above. The standalone "P3 wrapper delete + form
> wire-through" sub-phase and "P7 Release+deploy" sub-phase from the earlier
> draft are dropped as redundant (P7 is just P5; the wrapper delete is P3).

**Blocked-by:** P5 needs P0–P4. P1 can run in parallel with P0.

---

## ✅ LOCKED decisions (all 12 open items answered)

| ID | Item | Decision |
|----|------|----------|
| O1 | cPanel SMTP port | **A** — Port 587 STARTTLS, username/password |
| O2 | VPS reverse proxy | **A** — Caddy in compose (auto-TLS) |
| O3 | Production DB location | **A** — Same VPS, dockerized `postgres:17` in compose |
| O4 | CI → VPS deploy | **A** — `appleboy/ssh-action` (VPS SSH key as repo secret) |
| O5 | Magic-link audit cols | **A** — Drop bespoke `used_at`/`revoked_at`/`ip_address`/`user_agent`; use Better Auth `verification` table |
| O6 | `useAuth().can(perm)` | **A** — Adopt Better Auth native API (`checkRolePermission` / `session.user.role`); no shim |
| O7 | RBAC plugin | **A** — `admin` plugin only (global roles) |
| O8 | `users` table (role + status) | **B (expanded)** — Drop the **entire `users` table**; Better Auth `user` (with `role` from `admin` plugin) is single source of truth, `banned`/`metadata` replaces `status`. Users-page role **and** status filter/form/columns removed in P-Auth-Users (between P2/P3). See §2.6 + §5.8 for the migration map. |
| O9 | Existing users migration | **A** — Drop `password_hash` column + wipe users; fresh seed via Better Auth |
| O10 | Cookie `__Host-` prefix | **B (refined)** — Apply `__Host-` prefix to `auth_token` cookie **only**, gated on `NODE_ENV==='production'`. `active_theme` cookie stays plain (§5.9). Resolves the earlier draft conflict between this line and §2.7 (PA-4). |
| O11 | Sentry source maps | **A** — Upload source maps in `release.yml` |
| O12 | JWT `schema_version` claim | **A** — Skip (N/A with Better Auth DB sessions) |

### Carry-over notes from pre-plan Q&A (assumptions table)
- Q1 full swap + decommission wrappers ✅
- Q3 separate `auth-schema.ts` merged into `drizzle.config.ts` ✅
- Q5 SMTP: console in dev / smtp in prod via `EMAIL_TRANSPORT` ✅
- Q6 Docker: `oven/bun:1`, Nitro **`bun` preset**, entrypoint runs `db:migrate` ✅
- Q7 CI: `ci.yml` (PR gate) + `release.yml` (GHCR) + `deploy.yml` (SSH) ✅
- Q8 Sentry both frontend + server ✅
- Q9 keep V1+V2 auth pages, Drizzle, Router, React Query, Form; multitenant stays "won't" ✅

---

## Risks / open items (resolved)
- **O8 migration blast radius** — `users.role` is read in `src/lib/db/users.ts`,
  `src/features/users/**` (form, table, schemas, types), `src/routes/dashboard/users.tsx`.
  Dropping it requires re-pointing the Users-page role filter/form to Better Auth's `user`
  table. Tracked in P2/P3.
- cPanel SMTP verified 587 (O1=A); if host forces 465, switch transport `secure:true`.
- VPS proxy = Caddy (O2=A); `.env` on VPS holds `DATABASE_URL`/`AUTH_SECRET`/`MAIL_*`.

_All decisions locked. Ready to execute Phase 0 (Infra & CI)._

---

# Section 5 — Production Hardening: Redis · PgBouncer · BullMQ · Rate Limiting · TanStack libs

> **Write-only.** This section is documented per user instruction ("write but not implement").
> No `Dockerfile`, `docker-compose.yml`, CI workflows, or source files have been created.

> **PA-7 supersedence note.** Section 5 supersedes the Docker / CI / cookie
> portions of §1.2, §1.3, §1.4, §2.5, §2.7. Where they overlap,
> Section 5 wins (e.g. in-process worker R2-Q14=B, bitnami/pgbouncer
> R2-Q2=B, dropped global limiter R2-Q6=B, three-devtools R2-Q12=B/R2-Q18=B).
> §1.1 is already DONE and is not superseded. Sections 1.2–1.4 still
> stand as the P0/P1 execution spec; Section 5 adds the P-I* hardening
> on top.

## 5.1 Background & TanStack library scan

Current DB access (`src/lib/db/index.ts`) uses the `postgres` driver with `max: 10`
per instance, cached on `globalThis` in dev only. In the Nitro `bun` server each
process holds its own 10-connection pool → under SSR load this exhausts Postgres
`max_connections` (default 100). **PgBouncer in front fixes exactly this.**

TanStack library scan (`tanstack.com/libraries`) — what to add:

| Library | In repo? | Decision |
|---|---|---|
| Router / Query / Table / Form | ✅ | already used |
| **Pacer** (debounce/throttle/**rate-limit**/queue/batch) | ❌ | ✅ add (client) — **Pacer WINS**; remove overlapping in-repo hooks `src/hooks/use-debounce.tsx` + `src/hooks/use-debounced-callback.tsx` (migrate `use-data-table.ts` to Pacer) |
| **Virtual** (row virtualization) | ❌ | ✅ add (large tables) |
| **Devtools** (unified panel) | ❌ | ✅ add — **docs note:** keep BOTH `@tanstack/devtools` (unified) AND the existing separate Router/Query devtools for now; review at P-I4, deprecate later if unified covers all needs |
| DB (beta) | ❌ | ➖ overlaps React Query; skip |
| AI (beta) | ❌ | ➖ out of scope |
| Hotkeys / Intent / Store / CLI / Config / Ranger | ❌ | ➖ not relevant |

## 5.2 Locked decisions (all 16 open items answered)

| Q | Item | Decision |
|---|------|----------|
| — | Worker placement | **B (revised)** — worker runs INSIDE app process on startup (app entrypoint boots BullMQ Worker); no separate compose service |
| — | PgBouncer mode | **Transaction pool mode**; app → `pgbouncer:6432`, migrations/seed → direct `postgres:5432` |
| — | Rate limiting | **`rate-limiter-flexible`** (Redis store) as Nitro `onRequest` middleware + **TanStack Pacer** client-side |
| — | Redis cache | **Queue + rate-limit only now**; server-side data cache deferred to a later sub-phase |
| — | TanStack adds | **Pacer + Virtual + Devtools** — Pacer = canonical client debounce/throttle; in-repo `use-debounce`/`use-debounced-callback` hooks to be removed |
| Q1 | Postgres image | **B** — `postgres:17` (Debian-based) |
| Q2 | PgBouncer image | **B** (revised) — `bitnami/pgbouncer` image (env/ini config, healthchecks); drop custom Dockerfile |
| Q3 | PgBouncer sizing | **B** — Conservative: `default_pool_size=10`, `max_client_conn=100` |
| Q4 | Redis image/persist | **A** — `redis:7-alpine`, **no persistence** (queue + rate-limit only) |
| Q5 | Caddy TLS | **Cloudflare Tunnel on SEPARATE VM** — points to prod VM IP, SSL auto-terminated by Cloudflare. Caddy on prod VM = plain HTTP proxy (`:80`→`app:3000`), port **published to host** so the tunnel VM can reach it; no certs in compose |
| Q6 | Rate-limit tiers | **B (revised)** — Auth `10/min`, Server-fn `100/min`; **drop global** limiter (bounded by auth+fn) |
| Q7 | Rate-limit on Redis down | **A** — **Fail-open** (allow request, log warning) |
| Q8 | Queue scope | **A** — `email` queue only (magic-link, welcome, password reset) |
| Q9 | Email job retry | **A** — 3 attempts, exponential backoff `1m → 5m → 30m`, dead-letter on final failure |
| Q10 | Worker concurrency | **A** — 1 worker process, `concurrency=5` |
| Q11 | Virtual target tables | **A** — Products + Users tables |
| Q12 | Devtools scope | **B** — **Keep both** `@tanstack/devtools` (unified) AND existing Router/Query devtools in `__root.tsx`; review at P-I4 (docs note) |
| Q13 | Pacer primitives | **A** — throttle + debounce + rate-limit |
| Q14 | Dev-mode fallback | **A** — Detect `REDIS_URL`/`DATABASE_URL_DIRECT` presence; missing = rate-limit no-op + queue disabled + connect direct to Postgres |
| Q15 | Sentry / observability | **A** — Stay "Later"; not bundled with infra hardening |
| Q16 | Docs sync | **A** — Update docs after each phase completes |

## 5.2b Round-2 lock — compose/runtime detail (26 items)

All **A** (recommended) unless noted. Q6 answered by user.

| ID | Item | Decision |
|----|------|----------|
| R2-Q1 | PgBouncer conn | **A** — TCP `pgbouncer:6432` |
| R2-Q2 | Postgres user/pw | **A** — same user `tanstack`, stronger 32-char pw in VPS `.env` |
| R2-Q3 | PgBouncer `auth_type` | **A** — `scram-sha-256` + `userlist.txt` |
| R2-Q4 | Postgres `max_connections` | **A** — `100` |
| R2-Q5 | Compose network | **A** — default bridge |
| R2-Q6 | Cloudflare Tunnel host | **USER** — **separate VM**; points to prod VM IP; SSL auto-terminated by Cloudflare; NOT in compose |
| R2-Q7 | App port binding | **A** — `app` internal-only (no published port); Caddy reaches `app:3000` on compose net |
| R2-Q8 | Volume strategy | **A** — named volumes `pgdata`, `redisdata` |
| R2-Q9 | Compose project name | **A** — default |
| R2-Q10 | Backup | **A** — `docker exec pg_dump` cron on host, nightly, keep 7d |
| R2-Q11 | Nitro hook fallback | **A** — server middleware (`defineEventHandler` wrapper) if `onRequest` unavailable on `bun` preset |
| R2-Q12 | Rate-limit IP source | **A** — `cf-connecting-ip` (behind Cloudflare) |
| R2-Q13 | Limiter storage | **B (revised)** — 2 limiters (auth/fn) share 1 ioredis conn; global dropped |
| R2-Q14 | Worker shutdown | **B (revised)** — no separate service; SIGTERM handled in-process via BullMQ `Worker.close()` on app shutdown |
| R2-Q15 | Dead-letter store | **A** — same Redis `email:failed` key |
| R2-Q16 | Bull Board | **A** — no, defer |
| R2-Q17 | Worker startup | **A** — app entrypoint: `pg_isready` → `drizzle-kit migrate` → boot app + BullMQ Worker in-process (no separate migrator) |
| R2-Q18 | Devtools | **B** — keep BOTH `@tanstack/devtools` + existing Router/Query devtools in `__root.tsx`; note in docs (review at P-I4) |
| R2-Q19 | Virtual integration | **A** — row virtualization |
| R2-Q20 | Pacer wrapper | **KEEP Pacer** — thin hooks (`useDebouncedValue`, `useThrottledCallback`, `useRateLimited`); **remove** in-repo `src/hooks/use-debounce.tsx` + `src/hooks/use-debounced-callback.tsx`; migate `use-data-table.ts` to Pacer |
| R2-Q21 | package.json scripts | **A** — add `db:migrate:direct`; `worker`/`worker:dev` optional for local dev w/ Redis (in-process by default) |
| R2-Q22 | .dockerignore | **A** — standard set (exclude `node_modules`, `test-results`, `graphify-out`, `.git`; include `bun.lock`, not `.output/`) |
| R2-Q23 | compose override | **B (revised)** — skip `docker-compose.dev.yml`; local dev uses R2-Q14 fallback (`bun dev`, no infra) |
| R2-Q24 | CI matrix | **A** — 2-job (`test` + `build`) |
| R2-Q25 | entrypoint.sh ordering | **A** — `pg_isready` poll → `drizzle-kit migrate` → start app |
| R2-Q26 | Seed policy | **A** — never seed in prod; manual `bun run db:seed` only |

### 5.2c Pacer wrappers (PA-9 — locked: thin wrappers per plan)

> The wrappers below **do not exist yet**. This clarifies the R2-Q20 / Q13
> "Pacer wins" decision: we ADD thin hooks that wrap Pacer, we do NOT inline
> Pacer into call sites. Then we delete the two in-repo hooks.

**New files (`src/hooks/pacer/`):**
- `use-debounced-value.ts` → wraps Pacer `debounce` → replaces `use-debounce.tsx` (`useDebounce<T>`).
- `use-throttled-callback.ts` → wraps Pacer `throttle` → replaces `use-debounced-callback.ts` (`useDebouncedCallback`).
- `use-rate-limited.ts` → wraps Pacer `rateLimit` → new (no current equivalent; used later by P-I controls).

**Single consumer migrates:** `src/hooks/use-data-table.ts:173`
`useDebouncedCallback(...)` → `useDebouncedValue(...)`.

**Deleted in same PR (P-I4):** `src/hooks/use-debounce.tsx`,
`src/hooks/use-debounced-callback.ts`, and `src/hooks/use-callback-ref.tsx`
(the latter is only used by `use-debounced-callback.ts` → dead after it goes).

## 5.3 Target compose topology

```
[EXTERNAL VM] cloudflare-tunnel  → points to PROD VM IP; TLS auto   (R2-Q6: not in compose)
caddy (prod VM)  publishes :80 to host → app:3000   (plain HTTP proxy, no certs)  (Q5/R2-Q7)
app (internal)   bun server (.output); DATABASE_URL=pgbouncer:6432; REDIS_URL=redis:6379; NOT published; **boots BullMQ Worker in-process**  (R2-Q7, D1-B, R2-Q17)
pgbouncer         bitnami/pgbouncer; pool_mode=transaction; :6432 → db:6432   (Q2=B, Q3=B, R2-Q3)
redis              redis:7-alpine, no persistence, volume redisdata   (Q4=A, R2-Q8)
db (postgres:17) :5432, max_connections=100, volume pgdata   (R2-Q4, R2-Q8)
```

## 5.4 App / dependency changes

- **New deps:** `bullmq`, `ioredis`, `rate-limiter-flexible`,
  `@tanstack/pacer`, `@tanstack/virtual`, `@tanstack/devtools`.
- **`src/lib/db/index.ts`:** `DATABASE_URL` now points at pgbouncer; lower
  `postgres` `max` to ~5 (PgBouncer owns server-side pooling). Add
  `DATABASE_URL_DIRECT` for migrations.
- **Scripts (`package.json`):** `db:migrate` / `db:push` / `db:seed` use
  `DATABASE_URL_DIRECT` (bypass pgbouncer — transaction mode breaks
  multi-statement migrations).
  - **Item 10 (PB-10 clarified):** `db:migrate:direct` (R2-Q21) is an
    **explicit alias of `db:migrate`** that *also* forces `DATABASE_URL_DIRECT`
    and is what the container `entrypoint.sh` calls (PA-10). The difference is
    purely that `:direct` can never accidentally inherit the pgbouncer `DATABASE_URL`
    when run inside compose. Local dev may use either; CI/entrypoint use `:direct`.
  - Add `db:seed:users` → `scripts/seed-users.ts` (Better Auth `auth.api.createUser`
    loop; see §6.4 / Item 1). `db:seed` keeps products/kanban/notifications.
- **Env additions:** `DATABASE_URL` (→ pgbouncer), `DATABASE_URL_DIRECT`
  (→ postgres), `REDIS_URL`, rate-limit window/max.

## 5.5 Phase breakdown (appends to phased table)

| Phase | Work | Output |
|-------|------|--------|
| **P-I1 Infra** | compose (postgres + pgbouncer + redis + app + worker + caddy); env split; `src/lib/db/index.ts` connection split; `db:*` scripts → direct URL | Runnable hardened stack locally |
| **P-I2 Rate limit** | `rate-limiter-flexible` + ioredis; Nitro `onRequest` middleware (or `defineEventHandler` fallback, 5.6.1) keyed by `cf-connecting-ip` — strict `10/min` on `/api/auth/*`, `100/min` on server-fns; **no global limiter** (R2-Q6=B) | Server-side rate limiting |
| **P-I3 BullMQ** | `src/lib/queue/{connection,email-queue,email-worker,start-worker}.ts` (connection, `email` queue, in-process `Worker`, idempotent startup); Better Auth magic-link `sendMagicLink` enqueues (ties to P4 email work) | Async email off request path |

> **PA-11 — worker file naming.** No standalone `src/worker.ts` entry point
> (that implied a separate process). Per D1-B (R2-Q14=B) the BullMQ `Worker`
> is booted **in-process** from the app entrypoint via `start-worker.ts`,
> which is idempotent (guards against double-start under HMR/fork). SIGTERM
> is handled in-process via `Worker.close()` (R2-Q14=B). `email-queue.ts`
> exposes the `Queue('email', { connection })`; `email-worker.ts` is the
> `Worker('email', processor, { connection, concurrency: 5 })` (Q10=A).
| **P-I4 TanStack libs** | Pacer (client throttle/debounce hooks); Virtual (virtualize product/user tables); Devtools (unified panel in `__root.tsx`) | Client hardening + DX |
| **Later** | Redis server-side data cache (dashboard aggregates, product list) | Hot-path caching |

## 5.6 Verification gates (replaces the old "key risks" list — PA-8 / R2-Q11)

Each gate is a **check-before-build**, not a deferred concern. P-I2 commits
only after 5.6.1 passes; otherwise it falls back to the R2-Q11 wrapper.

- **5.6.1 Nitro `onRequest` hook on the `bun` preset — VERIFY FIRST.**
  Probe a sample `defineEventHandler`/`onRequest` in a throwaway `bun`-built
  server before P-I2. If the hook exists → use it as the rate-limit injection
  point. If absent → **fallback to a `defineEventHandler` server middleware**
  wrapper (R2-Q11=A). The old draft committed to `onRequest` unconditionally;
  this gate resolves that (PA-8).
- **5.6.2 PgBouncer transaction mode + postgres-js:** fine (no server-prepared
  statements, no session temp tables); Better Auth / Drizzle use standard queries.
- **5.6.3 BullMQ under bun:** ioredis + bullmq run on bun — verify at P-I3.
- **5.6.4 Dev fallback (Q14=A):** when `REDIS_URL` / `DATABASE_URL_DIRECT`
  are absent (local `bun dev` without compose), rate-limit + queue **no-op**
  (dev worker skipped) and DB connects **direct** to Postgres, so `bun dev`
  works without Redis/PgBouncer running.
- **5.6.5 Rate-limit keying behind Caddy:** read real client IP from
  `cf-connecting-ip` (R2-Q12=A), not the socket IP.
- **5.6.6 Split DATABASE_URL:** drizzle-kit must NOT go through pgbouncer
  (transaction mode breaks multi-statement migrations). Use `DATABASE_URL_DIRECT`.
- **5.6.7 Better Auth + Nitro `bun` preset interaction (NEW):** the Better Auth
  handler mounted at `/api/auth/$` runs as a server function under the `bun`
  server — confirm route resolution + cookie propagation before P2 lands.
- **5.6.8 Sentry init ordering (NEW):** gate `@sentry/*` init on
  `NODE_ENV==='production'` only; never init in `bun dev`. Client init in
  `__root.tsx` must run after the auth split is done (P2/P3) so it doesn't
  load on the pre-swap sign-in pages.

## 5.7 Synergy note

BullMQ email jobs (P-I3) + rate limiting (P-I2) + Better Auth magic-link (P2/P4)
form one cohesive "production hardening" block — email sending moves off the
request path into the worker, and auth endpoints get strict rate limits.

_End of Section 5. No files created._

---

# Section 6 — Code audit: omissions, deletions, overlaps (PA/B/C/D scrub)

> Produced by cross-referencing every plan decision against the current repo
> (`grep`/`read` of `src/`, `scripts/`, `e2e/`, `package.json`, docs).
> These are **plan-doc corrections only** — no repo code is touched by this plan
> until its phases execute.

## 6.1 B — Files the plan MUST touch but did not enumerate

| ID | File (current) | Why it's missed by the plan |
|----|----------------|-------------------------------------------|
| PB-1 | `src/components/layout/app-sidebar.tsx:152-155` | Hardcoded "Sign out" `<DropdownMenuItem>` — no `onClick`. Plan never lists it. After P3 it still renders dead UI unless wired to `authClient.signOut()`. |
| PB-2 | `src/components/layout/user-nav.tsx` | Entire `UserNav` is hardcoded `User` / `user@example.com`; **not mounted** in `header.tsx`. Plan must decide: delete, mount real, or leave dormant. |
| PB-3 | `scripts/seed.ts:41-54` | `seedUsers` never sets `password_hash` (depends on the nullable column). After O9 (drop column + wipe) it's moot, BUT Better Auth seeding needs a new path (CLI / `auth.api.signUpEmail`). Plan never describes it. |
| PB-4 | `src/features/users/components/users-table/columns.tsx:37-66` + `options.tsx` | Role + status columns + role filter (`useSearch().role` → `filters.roles` → `inArray(users.role, roles)`) break on `users` table removal (O8-B). Plan said "tracked in P2/P3" with no re-pointing. |
| PB-5 | `src/features/users/components/user-form-sheet.tsx:138-147` | `<FormSelectField name="role" options={ROLE_OPTIONS} />` — needs re-source (Better Auth roles) or removal. |
| PB-6 | `src/features/users/schemas/user.ts` + form sheet `status` field | `userSchema` keeps `role` & `status`; even after dropping `role`, `status` must be resolved (→ `banned`/`metadata`). |
| PB-7 | `src/lib/db/schema/users.ts` | `id: serial('id').primaryKey()` — Better Auth `user` table owns `id` (text/uuid by convention). Drop of `users` table implied but not spelled out. |
| PB-8 | `drizzle.config.ts` | Plan lists it (§2.2) for `auth-schema.ts` add, but doesn't note `users.ts` must be **removed** from the schema list in the same edit. |
| PB-9 | `src/components/themes/active-theme.tsx:7-11` + `src/routes/__root.tsx:21-22` | Plan hardens `auth_token` cookies, but `__root.tsx` also reads `active_theme` cookie (no `__Host-`). §5.9 resolves: `active_theme` stays plain. |
| PB-10 | `package.json` scripts | Plan adds `db:migrate:direct` (R2-Q21) but never states the diff from current `db:migrate` (env gate switch to `DATABASE_URL_DIRECT`). |
| PB-11 | `src/routes/auth/v2/*` (4 routes) | Plan keeps V1+V2 (Q9). They're inert until rebuilt to consume `authClient`. Fine — just confirming they survive P3. |
| PB-12 | `e2e/*.spec.ts` | No auth E2E exists. Plan never adds one in P2/P3, but swapping the whole auth path should exercise a protected route behind the new session. |

## 6.2 C — Deletion lock (explicit deletes, not "depends")

Apply these as concrete deletions, sequenced per phase:

**P2 / P-Auth-Users (Better Auth cutover):**
1. `src/lib/auth/server.ts` — entire file (`signInUserFn`, `signUpUserFn`, `getSessionFn`, `signOutUserFn`).
2. `src/lib/auth/client.tsx` — entire file (`AuthProvider`, `useAuth`).
3. `src/lib/db/schema/users.ts` — entire file (drops `users` table from Drizzle schema).
4. `src/lib/db/schema/users.test.ts` — entire file (tests the dropped enum).
5. `src/lib/db/users.ts` — rewritten (not deleted) as Better Auth admin-plugin server fns (`listUsersFn`, `createUserFn`, `updateUserFn`, `deleteUserFn` calling `authClient.admin.*`).
6. `scripts/seed.ts` `seedUsers` branch — removed; users seeded via Better Auth instead.
7. `src/features/users/components/users-table/options.tsx` — entire file (`ROLE_OPTIONS`).
8. `src/features/users/schemas/user.ts` `role` + `status` fields — removed.
9. `migrations/0000_*.sql` + `migrations/meta/000{0..4}_snapshot.json` — regenerated by `db:generate` after the `users` table + enums drop (new `000X_drop_users.sql`).

**P3 (deps):** `bcryptjs`, `jose`, `@types/bcryptjs` (consolidated PA-6).

**P-I4 (Pacer wins):**
10. `src/hooks/use-debounce.tsx` — superseded by Pacer `useDebouncedValue`.
11. `src/hooks/use-debounced-callback.ts` — superseded by Pacer `useThrottledCallback`.
12. `src/hooks/use-callback-ref.tsx` — dead after #11 (only consumer was `use-debounced-callback.ts`).

## 6.3 D — Overlap / keep candidates (resolved)

| ID | Item | Decision |
|----|-------|-----------|
| PD-1 | `getSessionFn` (wrapper) | Replaced inline in `dashboard.tsx` `beforeLoad` with `auth.api.getSession({ headers: ctx.request.headers })`. No standalone wrapper. |
| PD-2 | `active_theme` cookie / `ActiveThemeProvider` / `getActiveTheme` | Orthogonal to auth. Kept; **excluded** from `__Host-` (§5.9). |
| PD-3 | `users.status` column | Per user decision: **dropped** with `users.role` (O8-B expanded). Moves to Better Auth `banned` / profile `metadata`. |
| PD-4 | 3 devtools panels (`TanStackRouterDevtools` + `ReactQueryDevtools` + new `TanStackDevtools`) | Per R2-Q12=B / R2-Q18=B + user: **keep all three** in dev (`__root.tsx`). Review at P-I4. |
| PD-5 | V1 vs V2 auth routes | Kept (Q9). Doc sentence added: both variants exist as a UX choice, not technical debt. |
| PD-6 | `__Host-` cookie prefix (O10=B) | Per user: **`auth_token` only, prod-only** (`NODE_ENV==='production'` gate). Dev keeps unprefixed name. |
| PD-7 | `seedUsers` replacement strategy | Recommend `scripts/seed-users.ts` calling `auth.api.signUpEmail` (option (a)) over a temp `betterAuth({...})` bootstrap — flagged for user confirmation in execution. |

## 6.4 §5.8 — P-Auth-Users migration map (sits between P2 and P3)

File-by-file, with citations:

| File | Action | Detail |
|------|--------|--------|
| `src/lib/db/users.ts` | REWRITE | Replace Drizzle `getUsers`/`createUser`/`updateUser`/`deleteUser` with Better Auth admin-plugin wrappers (`authClient.admin.listUsers`, `.createUser`, `.updateUser`, `.removeUser`). `sortColumn`/`inArray(users.role,...)` lines deleted. |
| `src/lib/db/schema/index.ts` | EDIT | `export * from './users'` removed (table gone). |
| `src/features/users/api/queries.ts` | EDIT | `usersQueryOptions` → calls new `listUsersFn`. Drop `roles` filter param. |
| `src/features/users/api/mutations.ts` | EDIT | `createUserMutation`/`updateUserMutation`/`deleteUserMutation` → Better Auth admin client wrappers. Drop `role`/`status` payload fields. |
| `src/features/users/api/service.ts` | EDIT | Re-export new server fns. |
| `src/features/users/api/types.ts` | EDIT | `User` type: drop `role` + `status`. Keep `first_name`,`last_name`,`email`,`phone`,`created_at`,`updated_at` (or map to Better Auth `user` shape). |
| `src/features/users/schemas/user.ts` | EDIT | `userSchema`: remove `role` + `status` (§8-C #8). |
| `src/features/users/components/users-table/columns.tsx` | EDIT | Delete `role` (id 37) + `status` (id 58) columns + badge logic. |
| `src/features/users/components/users-table/options.tsx` | DELETE | Entire file (§8-C #7). |
| `src/features/users/components/users-table/index.tsx` | EDIT | Remove `role` from `useSearch()` destructuring + `filters.roles` wiring (lines 18, 26). |
| `src/features/users/components/user-form-sheet.tsx` | EDIT | Remove `<FormSelectField name="role" ...>` (138-147) + `status` field; `defaultValues.role/.status` removed. |
| `src/features/users/components/user-listing.tsx` | REVIEW | Confirm no `users.role`/`users.status` reads; adjust if present. |
| `scripts/seed.ts` | EDIT | Remove `seedUsers` + `USER_ROLES`/`USER_STATUSES` + `users` import (§8-C #6). |
| `src/components/layout/app-sidebar.tsx` | EDIT | Wire "Sign out" → `authClient.signOut()`; replace hardcoded `User`/`user@example.com` with `useSession()` values (PB-1). |
| `src/components/layout/user-nav.tsx` | **DELETE (decided).** Unmounted dead stub (not imported by `header.tsx` — verified). Removed now; Better Auth-aware user menu is wired into `app-sidebar.tsx` "Sign out" at P3 (§6.4). See §6.8 #3. |
| `src/routes/__root.tsx` | EDIT | Remove `<AuthProvider>` (79-82); rely on `authClient.useSession`. Add `TanStackDevtools` (see §5.10). |
| `src/routes/dashboard.tsx` | EDIT | `beforeLoad` → `auth.api.getSession({ headers: ctx.request.headers })` (replace `getSessionFn`, PD-1). |
| `src/features/auth/components/user-auth-form.tsx` | EDIT | `signIn` from `authClient.signIn.email` (replace `useAuth().signIn`). |
| `src/features/auth/components/register-form.tsx` | EDIT | `signUp` from `authClient.signUp.email` (replace `useAuth().signUp`). |

## 6.5 §5.9 — Cookie scope clarification (resolves PB-9 / O10-B)

| Cookie | `__Host-` prefix? | Env gate | Notes |
|--------|------------------|-----------|-------|
| `auth_token` (Better Auth session) | **YES**, but only when `NODE_ENV==='production'` | prod-only | Browsers reject `__Host-` over plain HTTP, so `bun dev` keeps the unprefixed name. |
| `active_theme` | **NO** | — | Set client-side (`active-theme.tsx:7-11`). Deliberately excluded; documented exception. |

## 6.6 §5.10 — Devtools tri-panel layout (`__root.tsx`, dev only)

```tsx
<ThemeProvider>
  <ActiveThemeProvider>
    <Outlet />
    <TanStackRouterDevtools position='bottom-left' />   // existing
    <ReactQueryDevtools initialIsOpen={false} />          // existing
    <TanStackDevtools position='bottom-right' />          // NEW (unified)
  </ActiveThemeProvider>
</ThemeProvider>
```

All three are gated to dev (they're already dev-only imports). Review at P-I4 (R2-Q12=B / R2-Q18=B).

## 6.7 §5.11 — Files-to-delete lock (consolidated checklist)

Mirror of §8-C, single checklist for execution:

- [ ] `src/lib/auth/server.ts`
- [ ] `src/lib/auth/client.tsx`
- [ ] `src/lib/db/schema/users.ts`
- [ ] `src/lib/db/schema/users.test.ts`
- [ ] `src/lib/db/users.ts` (rewritten, not deleted)
- [ ] `src/features/users/components/users-table/options.tsx`
- [ ] `src/hooks/use-debounce.tsx`
- [ ] `src/hooks/use-debounced-callback.ts`
- [ ] `src/hooks/use-callback-ref.tsx`
- [ ] `scripts/seed.ts` → drop `seedUsers` branch
- [ ] Deps: `bcryptjs`, `jose`, `@types/bcryptjs`
- [ ] `drizzle.config.ts` → remove `users.ts` from schema list
- [ ] `migrations/` → new `000X_drop_users.sql` + regenerated `meta/` snapshots

## 6.8 Open items register (single source of truth)

| # | Item | Resolution / status |
|---|------|----------------------|
| 1 | `seedUsers` replacement | **Resolved (recipe in §6.9.1).** `scripts/seed-users.ts` → `auth.api.createUser({ body: { email, password, name, role } })` loop (bypasses email verification, applies `admin` role, Better Auth owns password hashing). Add `db:seed:users` script. Resolves PB-3 + O9=A. |
| 2 | Prod `users` data preservation | **Assume none** (greenfield/demo; no prod DB yet). Safety net: one-off `scripts/export-users.ts` (§6.9.2, `auth.api.listUsers` → JSON) runs *before* `000X_drop_users.sql` (§6.9.3) if a prod `DATABASE_URL` is detected. Near-zero effort, zero risk. |
| 3 | `user-nav.tsx` disposition (PB-2) | **DECIDED: delete.** Unmounted dead stub (no importers; verified). Removed now. Better Auth-aware user menu is wired into `app-sidebar.tsx` "Sign out" at P3. |
| 4 | `user-listing.tsx` audit (§6.4) | **Audit at P3.** Confirm no `users.role`/`users.status` reads. |
| 5 | `e2e` auth coverage (PB-12) | **Add at P3.** Protected-route test behind new Better Auth session. |
| 6 | 5.6.1 Nitro `onRequest` exists? | **Gate before P-I2.** Else `defineEventHandler` fallback (R2-Q11). |
| 7 | 5.6.7 Better Auth `/api/auth/$` under `bun` | **Verify before P2.** |
| 8 | 5.6.8 Sentry init prod-only | **Gate on `NODE_ENV==='production'`.** Never in `bun dev`. |
| 9 | Phase-collapse (P3 + §6.4 / P7↔P5) | **Applied.** Merged client cutover + `users` drop into single P3; dropped redundant sub-phases (§phased table note). |
| 10 | `db:migrate` vs `:direct` diff (PB-10) | **Clarified in §5.4.** `:direct` = explicit `DATABASE_URL_DIRECT` alias used by entrypoint; local dev may use either. |
| 11 | `dist/` `.output/` `test-results/` `graphify-out/` | **Applied to P0 (§1.2).** Added to `.gitignore` + `.dockerignore`. |

## 6.9 Seed + migration recipe (concretizes items 1–2)

> Actionable steps for P3 / P0. Pseudo-code only — real types come
> from the `better-auth` + `@better-auth/drizzle-adapter` install in P2.

### 6.9.1 `scripts/seed-users.ts` (item 1 — replaces `seedUsers`)
```ts
import { auth } from '@/lib/auth/auth';            // the P2 betterAuth({...}) instance
import { faker } from '@faker-js/faker';

const ROLES = ['admin', 'user'] as const;            // Better Auth admin-plugin roles
const N = 50;

for (let i = 0; i < N; i++) {
  await auth.api.createUser({
    body: {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      role: faker.helpers.arrayElement(ROLES),
      // `admin` plugin: role granted; no email verification fired
    },
  });
}
```
- **Why `auth.api.createUser` (not `signUpEmail`):** programmatic create
  bypasses the magic-link / verification flow, lets Better Auth own
  password hashing via the Drizzle adapter, and applies the `admin` plugin
  `role`. Resolves PB-3 (no `password_hash` to set) + O9=A.
- **DECISION (user, this session):** use a **single `name` field** (Better
  Auth `user.name`) for now; split into `first_name`/`last_name` **later**
  when scale demands. The old `user-form-sheet.tsx` `first_name`/`last_name`
  fields are replaced by one `name` input at P3. Roles kept **minimal**
  (`admin` / `user`) — the old 6-value `user_role` enum is dropped with
  the `users` table (O8-B); richer RBAC roles are a "Later" concern.
- **Recreate, don't migrate (user, this session):** all current `users` rows are
  dummy/fake seed data on a dev DB. So `000X_drop_users.sql` is a
  **recreate**: drop the old table, let Better Auth `generate` create its own
  `user`/`session`/`account`/`verification` tables (`auth-schema.ts`).
  `scripts/export-users.ts` (§6.9.2) stays as a zero-cost guard for the
  (currently non-existent) prod case, but on dev it's a no-op.
- **`package.json`** adds: `"db:seed:users": "bun run scripts/seed-users.ts"`.
- **`scripts/seed.ts`** keeps only `seedProducts` / `seedKanban` /
  `seedNotifications`; the `seedUsers` branch + `USER_ROLES` /
  `USER_STATUSES` / `users` import are deleted (§6.2 #6).

### 6.9.2 `scripts/export-users.ts` (item 2 — one-off pre-migration guard)
```ts
import { auth } from '@/lib/auth/auth';
import { writeFileSync } from 'node:fs';

const { users } = await auth.api.listUsers({ query: { limit: 10_000 } });
if (users.length > 0) {
  writeFileSync('users-export.json', JSON.stringify(users, null, 2));
  console.log(`Exported ${users.length} users → users-export.json`);
}
```
- **Run order:** `bun run db:export:users` (adds script in P0/P3)
  **before** applying `000X_drop_users.sql`. Only needed if a prod
  `DATABASE_URL` points at a DB with live rows. Greenfield/demo =
  no-op.
- This is the safety net for O9=A ("wipe users; fresh seed") — zero
  risk, near-zero effort, satisfies item 2 without blocking P3.

### 6.9.3 `000X_drop_users.sql` (item 2 — the migration)
```sql
-- Pre: run scripts/export-users.ts if prod DB has rows
DROP TABLE IF EXISTS "users" CASCADE;
DROP TYPE IF EXISTS "user_role";
DROP TYPE IF EXISTS "user_status";
```
- `drizzle-kit` regenerates `migrations/meta/000{0..4}_snapshot.json`
  after the `users` table + enums leave `drizzle.config.ts` (§6.2 #9,
  §6.4 `src/lib/db/schema/index.ts` edit).
- Never migrate through pgbouncer — use `db:migrate:direct`
  (`DATABASE_URL_DIRECT`, §5.4 / PB-10).

---

_End of Section 6. Plan-doc scrub complete — PA-1…PA-11, B (PB-1…PB-12), C (1…12), D (PD-1…PD-7) all resolved. Open-items register (§6.8) tracks 1–11. §6.9 adds the concrete seed + migration recipe for items 1–2. No repo code changed._
