# API Documentation

## Server Functions

All server functions are defined in `src/features/<feature>/api/service.ts`
and expose database operations via `createServerFn()`. Handlers use dynamic
imports to prevent the `postgres` driver from leaking into the client bundle.

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
