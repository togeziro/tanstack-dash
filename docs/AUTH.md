# Authentication

## Overview

JWT-based auth stored in HTTP-only cookies. Passwords hashed with `bcryptjs`. Session validated on every request via server functions.

## Key Files

| File | Purpose |
|---|---|
| `src/lib/auth/server.ts` | Server functions: `signInUser`, `signUpUser`, `getSession`, `signOutUser` |
| `src/lib/auth/client.tsx` | `AuthProvider` React context + `useAuth()` hook |
| `src/lib/db/schema/users.ts` | Drizzle schema — users table with `password_hash` column |
| `src/routes/auth/sign-in/index.tsx` | Route for `/auth/sign-in` (V1-style split-screen) |
| `src/routes/auth/v2/sign-in/index.tsx` | Alternative route `/auth/v2/sign-in` |
| `src/routes/auth/v2.tsx` | 50/50 branded split-screen layout for V2 auth pages |
| `src/features/auth/components/sign-in-view.tsx` | V1 split-screen page component |
| `src/features/auth/components/sign-up-view.tsx` | V1 split-screen register page |
| `src/features/auth/components/user-auth-form.tsx` | Shared login form (email + password + remember me) |
| `src/features/auth/components/register-form.tsx` | Shared register form (email + password + confirm) |
| `src/features/auth/components/github-auth-button.tsx` | GitHub OAuth button (placeholder) |
| `src/features/auth/components/interactive-grid.tsx` | Decorative SVG grid pattern |

## Data Flow

### Sign In

1. User submits email + password + (optional) remember via `@tanstack/react-form` with Zod validation
2. Client calls `signInUser(email, password, remember)` server function
3. Server lowercases/trims email, looks up user, compares password with `bcryptjs.compare()`
4. On success: creates JWT (`jose`), sets `auth_token` HTTP-only cookie (1 day expiry, or 30 days if "remember me" checked), returns user
5. Client `AuthProvider` updates context, redirects to `/dashboard/overview`
6. On failure: returns `{ success: false, message }` — form shows toast error

### Sign Up

1. User submits email + password + confirm password + name
2. Client calls `signUpUser(...)` server function
3. Server lowercases/trims email via Zod `.transform()`, hashes password with `bcryptjs.hash()` (cost 12), inserts user
4. On unique constraint violation: returns "Email already in use" (TOCTOU-safe, no pre-check race)
5. On success: creates JWT, sets cookie, returns user
6. Client redirects to `/dashboard/overview`

### Session Validation

- `getSession()` server function reads `auth_token` cookie, verifies JWT with `jose`, looks up user by id
- Called by `AuthProvider` on mount via React Query
- Called by dashboard `beforeLoad` route guard — redirects to `/auth/sign-in` if invalid
- Both callers handle errors gracefully — invalid/expired tokens return `{ user: null }`

### Error Handling

All server functions wrap handler bodies in try/catch:
- Unexpected errors are logged server-side (`console.error`)
- Client always receives a safe `{ success: false, message }` response (no stack traces)
- `signUpUserFn` distinguishes unique constraint violations from other errors

## DB Schema

```diff
 users table:
   id: serial
   first_name: text
   last_name: text
   email: text (unique)
+  password_hash: text
   phone: text
   status: user_status_enum
   role: user_role_enum
   created_at: timestamp
   updated_at: timestamp
```

## Route Layout

| Route | Component | Auth Required |
|---|---|---|
| `/auth/sign-in` | V1 split-screen (replaces old page) | No |
| `/auth/sign-up` | V1 split-screen (replaces old page) | No |
| `/auth/v2/sign-in` | V2 centered card (alternative) | No |
| `/auth/v2/sign-up` | V2 centered card (alternative) | No |
| `/dashboard/*` | All dashboard routes | Yes — `beforeLoad` redirect |

> **Default:** V1 (`/auth/sign-in`) is the primary login page — both the dashboard `beforeLoad` route guard and the `/auth/` index redirect there. V2 is an alternative variant at `/auth/v2/sign-in` with no route wired to it by default.

## Auth Provider

Wired in `src/routes/__root.tsx` wrapping `<Outlet />`:

```tsx
<AuthProvider>
  <Toaster />
  <Outlet />
</AuthProvider>
```

## V1 vs V2 Login Styles

| Aspect | V1 | V2 |
|---|---|---|
| Layout | Self-contained 1/3 + 2/3 split | 50/50 grid via layout.tsx |
| Brand panel | Left — icon + "Hello again" text | Right — app name + info cards |
| Form width | `max-w-md` (448px) | `sm:w-[350px]` |
| Chrome | None | Top bar (Register link) + bottom bar (copyright + lang) |
| Google button | Below form, `variant="outline"` | Above form with "Or continue with" divider, `variant="secondary"` |
| Tone | Playful subtitle | Formal "Login to your account" |

## Dependencies

- `bcryptjs` — password hashing
- `jose` — JWT sign/verify
