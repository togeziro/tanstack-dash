# API Documentation

## Server Functions

All server functions are defined in `src/features/<feature>/api/service.ts`
and expose database operations via `createServerFn()`. Handlers use dynamic
imports to prevent the `postgres` driver from leaking into the client bundle.

### RPC boundary guarantees

- **Authentication**: every endpoint calls `requireSession()` (or
  `requireRole('admin')` for product/user writes) at the top of its handler,
  so endpoints cannot be called unauthenticated — independent of route guards.
- **Input validation**: every endpoint uses a Zod schema from
  `src/features/<feature>/api/validation.ts` via `@tanstack/zod-adapter`'s
  `zodValidator`. Schemas are typed `z.ZodType<ExistingType>` so they cannot
  drift from the request types.
- **Error mapping**: `lib/db/*.ts` wraps DB calls in `mapDbError`
  (`src/lib/errors.ts`); intentional errors throw `DomainError` and pass
  through, unexpected errors become a generic message.

> Note: authentication is enforced at the boundary, but **notifications are not
> owner-scoped** (any authenticated user can reach any notification by id). See
> `docs/TODO.md`. "Authenticated" is not the same as "authorized" for
> per-resource ownership.

### Products

| Function           | Method | Payload                  | Returns                |
| ------------------ | ------ | ------------------------ | ---------------------- |
| `getProductsFn`    | GET    | `ProductFilters`         | `ProductsResponse`     |
| `getProductByIdFn` | GET    | `number` (id)            | `ProductByIdResponse`  |
| `createProductFn`  | POST   | `ProductMutationPayload` | `Product`              |
| `updateProductFn`  | POST   | `{ id, values }`         | `Product`              |
| `deleteProductFn`  | POST   | `number` (id)            | `{ success, message }` |

### Users

| Function       | Method | Payload               | Returns                |
| -------------- | ------ | --------------------- | ---------------------- |
| `getUsersFn`   | GET    | `UserFilters`         | `UsersResponse`        |
| `createUserFn` | POST   | `UserMutationPayload` | `User`                 |
| `updateUserFn` | POST   | `{ id, values }`      | `User`                 |
| `deleteUserFn` | POST   | `number` (id)         | `{ success, message }` |

### Kanban

| Function     | Method | Payload           | Returns                  |
| ------------ | ------ | ----------------- | ------------------------ |
| `getBoardFn` | GET    | —                 | `Record<string, Task[]>` |
| `addTaskFn`  | POST   | `AddTaskPayload`  | `Task`                   |
| `moveTaskFn` | POST   | `MoveTaskPayload` | `{ success }`            |

### Auth

Auth is handled by **Better Auth** — see [AUTH.md](./AUTH.md) for the full API.

| Endpoint      | Methods  | Purpose                         |
| ------------- | -------- | ------------------------------- |
| `/api/auth/$` | GET/POST | Better Auth handler (catch-all) |

Client-side helpers: `authClient.signIn.email`, `authClient.signUp.email`, `authClient.signOut`, `authClient.useSession`.

Server-side helpers: `auth.api.getSession`, `auth.api.listUsers` (admin), `auth.api.createUser` (admin).

### Notifications

| Function               | Method | Payload                  | Returns                |
| ---------------------- | ------ | ------------------------ | ---------------------- |
| `getNotificationsFn`   | GET    | —                        | `NotificationItem[]`   |
| `markAsReadFn`         | POST   | `{ id: number }`         | `{ success: boolean }` |
| `markAllAsReadFn`      | POST   | —                        | `{ success: boolean }` |
| `addNotificationFn`    | POST   | `AddNotificationPayload` | `NotificationItem`     |
| `removeNotificationFn` | POST   | `{ id: number }`         | `{ success: boolean }` |
