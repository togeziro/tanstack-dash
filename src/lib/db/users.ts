/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/auth/auth';
import type { UserFilters, UsersResponse, UserMutationPayload } from '@/features/users/api/types';

function toUser(betterUser: any) {
  const nameParts = (betterUser.name || '').split(' ');
  return {
    id: Number.parseInt(betterUser.id, 10) || 0,
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    email: betterUser.email || '',
    phone: null as string | null,
    status: betterUser.banned ? 'Inactive' : 'Active',
    role: betterUser.role || 'user',
    created_at: betterUser.createdAt || new Date().toISOString(),
    updated_at: betterUser.updatedAt || new Date().toISOString()
  };
}

export async function getUsers(filters: UserFilters): Promise<UsersResponse> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;

  const result: any = await auth.api.listUsers({
    query: { limit, offset, sortBy: filters.sort || 'createdAt' }
  });

  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Users fetched from Better Auth',
    total_users: result.total || 0,
    offset,
    limit,
    users: (result.users || []).map(toUser)
  };
}

export async function createUser(data: UserMutationPayload) {
  const created: any = await (auth.api as any).createUser({
    body: {
      email: data.email,
      password: Math.random().toString(36).slice(-12),
      name: `${data.first_name} ${data.last_name}`.trim(),
      role: data.role || 'user'
    }
  });

  return { success: true, message: 'User created successfully', user: toUser(created) };
}

export async function updateUser(id: number, data: UserMutationPayload) {
  const usersList: any = await auth.api.listUsers({ query: { limit: 1 } });
  if (!usersList.users?.length) {
    return { success: false, message: `User with ID ${id} not found` };
  }

  const targetId = usersList.users[0].id as string;
  const updated: any = await (auth.api as any).updateUser({
    body: {
      name: `${data.first_name} ${data.last_name}`.trim(),
      role: data.role || 'user',
      banned: data.status === 'Inactive' || undefined,
      banReason: data.status === 'Inactive' ? 'Deactivated by admin' : undefined
    },
    params: { userId: targetId }
  });

  return { success: true, message: 'User updated successfully', user: toUser(updated) };
}

export async function deleteUser(id: number) {
  const usersList: any = await auth.api.listUsers({ query: { limit: 1 } });
  if (!usersList.users?.length) {
    return { success: false, message: `User with ID ${id} not found` };
  }

  const targetId = usersList.users[0].id as string;
  await auth.api.removeUser({ body: { userId: targetId } });
  return { success: true, message: 'User deleted successfully' };
}
