# Authentication

## Overview

Authentication uses **Better Auth** v1, a DB-session-based auth system integrated
directly with Drizzle ORM and TanStack Start.

## Key Files

| File                          | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `src/lib/auth/auth.ts`        | Auth server config (plugins, callbacks)        |
| `src/lib/auth/auth-client.ts` | Client-side auth helpers                       |
| `src/lib/auth/session.ts`     | `getSession()` / `ensureSession()`             |
| `src/lib/auth/permissions.ts` | RBAC access control with `createAccessControl` |
| `src/lib/db/auth-schema.ts`   | Drizzle schema for Better Auth tables          |
| `src/routes/api/auth/$.ts`    | Catch-all API route for Better Auth            |

## Auth Tables (Better Auth)

Better Auth owns four tables in the database:

- `user` — email, hashed password, name, role, banned status
- `session` — session tokens tied to users (server-managed)
- `account` — OAuth / email account links (supports future social auth)
- `verification` — email verification codes

These replace the old single `users` table and custom JWT. Role and ban status
are stored on the `user` table directly, managed through the Better Auth `admin` plugin.

## Flow

### Sign In

1. User submits email + password in `user-auth-form.tsx`
2. Form calls `authClient.signIn.email({ email, password })`
3. Better Auth validates credentials, creates a session, sets cookies via `tanstackStartCookies` plugin
4. On success, the client navigates to `/dashboard`

### Sign Up

1. User submits name + email + password in `register-form.tsx`
2. Form calls `authClient.signUp.email({ name, email, password })`
3. Better Auth creates the user record + initial session
4. On success, the client navigates to `/dashboard`

### Session Check (Route Guard)

Dashboard routes use a `beforeLoad` handler:

```ts
beforeLoad: async ({ location }) => {
  if (location.pathname.startsWith('/dashboard')) {
    await ensureSession();
  }
};
```

`ensureSession()` calls `auth.api.getSession({ headers })` and redirects to
`/auth/sign-in` if the session is missing or expired.

### Sign Out

The sidebar "Sign out" button calls `authClient.signOut()`, then navigates
to `/auth/sign-in`.

## RBAC (Role-Based Access Control)

Better Auth's `admin` plugin powers all role/permission checks:

```ts
// src/lib/auth/permissions.ts
const ac = createAccessControl([
  defaultRole,
  {
    role: 'admin'
    // ...
  }
]);
```

Roles are stored on the `user.role` column. Checks are done server-side using
`auth.api.listUsers`, `auth.api.createUser`, etc. The admin API accepts
`fetchOptions` (or is called on the server with `headers`) so the request
propagates the session cookie automatically.

## Configuration

Auth config lives in `src/lib/auth/auth.ts`:

```ts
export const auth = betterAuth({
  // In dev, derive the base URL from the request origin so Caddy-served
  // hosts (e.g. http://172.17.16.3:8082) pass Better Auth's CSRF origin check.
  // Production should set BETTER_AUTH_URL instead.
  baseURL: process.env.BETTER_AUTH_URL
    ? process.env.BETTER_AUTH_URL
    : {
        allowedHosts: ['localhost:*', '127.0.0.1:*', '172.17.16.3:*'],
        protocol: 'auto'
      },
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  plugins: [admin(), tanstackStartCookies()]
});
```

- **Email + password** authentication is enabled
- **Admin plugin** adds RBAC + user management endpoints
- **tanstackStartCookies** adapts cookie handling to TanStack Start's `request`/`response` objects

## Demo Credentials

`scripts/seed.ts` seeds a single demo account (idempotent — re-running
`bun run db:seed` skips it if the email already exists):

| Email               | Password       | Role  |
| ------------------- | -------------- | ----- |
| `admin@example.com` | `Password123!` | admin |

Use these to log in at `/auth/sign-in`. The account has the Better Auth
`admin` role, so all RBAC checks pass.

## TanStack Start Splat Handler

Better Auth's endpoints are multi-segment (`/sign-in/email`,
`/admin/create-user`, …), so they live under a catch-all route
`src/routes/api/auth/$.ts` (`$` is TanStack Start's splat, not `$$`).
TanStack Start only invokes a route's `server.handlers` on **exact**
matches by default, which means splat routes never fire. `node_modules/
@tanstack/start-server-core/dist/esm/createStartHandler.js` is patched so
`server.handlers` also run on splat routes. `scripts/postinstall.js`
re-applies this patch automatically after `bun install`.

## Form Components

### `user-auth-form.tsx`

- Renders email + password fields
- Password field has a show/hide eye toggle (`Icons.eye` / `Icons.eyeOff`), hidden by default
- On submit: `authClient.signIn.email(...)`
- On success: navigates to `/dashboard`
- Displays inline error messages on failure

### `register-form.tsx`

- Renders name + email + password + confirm-password fields
- Both password fields have independent show/hide eye toggles
- On submit: `authClient.signUp.email(...)` with combined `name`
- On success: navigates to `/dashboard`
- Displays inline error messages on failure

## Migration from Custom JWT

The existing session cookie from Better Auth is opaque (not a JWT). No custom
token logic or manual hashing is needed — Better Auth manages all of that.

The old `bcryptjs` and `jose` packages have been removed. All user management
(create, update, delete, list) now goes through the Better Auth admin API via
`src/lib/db/users.ts`.
