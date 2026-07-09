// ============================================================
// User Service — Server-function wrappers
// ============================================================
// These wrappers expose the server-only data access (PostgreSQL via
// Drizzle) as TanStack Start server functions. The actual DB module is
// imported dynamically inside each handler, so the `postgres` driver is
// never bundled into the client. Response shape (UsersResponse) is
// preserved so routes & components are untouched.

import { createServerFn } from '@tanstack/react-start';
import type { UserFilters, UserMutationPayload } from './types';

export const getUsersFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as UserFilters)
  .handler(async ({ data }) => {
    const { getUsers } = await import('@/lib/db/users');
    return getUsers(data);
  });

export const createUserFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as UserMutationPayload)
  .handler(async ({ data }) => {
    const { createUser } = await import('@/lib/db/users');
    return createUser(data);
  });

export const updateUserFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as { id: number; values: UserMutationPayload })
  .handler(async ({ data: { id, values } }) => {
    const { updateUser } = await import('@/lib/db/users');
    return updateUser(id, values);
  });

export const deleteUserFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as number)
  .handler(async ({ data: id }) => {
    const { deleteUser } = await import('@/lib/db/users');
    return deleteUser(id);
  });
