// ============================================================
// User data access (server-only) — PostgreSQL via Drizzle
// ============================================================
// Imported dynamically from the server-function wrappers in
// src/features/users/api/service.ts, so the `postgres` driver
// never ends up in the client bundle.

import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from './index';
import { users, userRoleEnum } from './schema/users';
import type { UserFilters, UsersResponse, UserMutationPayload } from '@/features/users/api/types';

type UserRole = (typeof userRoleEnum.enumValues)[number];

function parseSort(sort?: string) {
  if (!sort) return undefined;
  try {
    const items = JSON.parse(sort) as { id: string; desc: boolean }[];
    return items[0];
  } catch {
    return undefined;
  }
}

function sortColumn(id: string) {
  switch (id) {
    case 'name':
      return users.first_name;
    case 'first_name':
      return users.first_name;
    case 'last_name':
      return users.last_name;
    case 'email':
      return users.email;
    case 'phone':
      return users.phone;
    case 'status':
      return users.status;
    case 'role':
      return users.role;
    case 'created_at':
      return users.created_at;
    case 'updated_at':
      return users.updated_at;
    case 'id':
      return users.id;
    default:
      return undefined;
  }
}

function serialize(row: typeof users.$inferSelect) {
  return {
    ...row,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString()
  };
}

export async function getUsers(filters: UserFilters): Promise<UsersResponse> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;

  const rawRoles = filters.roles ? String(filters.roles) : '';
  const roles = rawRoles
    .split(/[.,]/)
    .map((r) => r.trim())
    .filter(Boolean) as UserRole[];
  const search = filters.search?.trim();

  const conditions = [];
  if (roles.length > 0) {
    conditions.push(inArray(users.role, roles));
  }
  if (search) {
    conditions.push(
      or(
        ilike(users.first_name, `%${search}%`),
        ilike(users.last_name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const sortItem = parseSort(filters.sort);
  let orderBy;
  if (sortItem) {
    if (sortItem.id === 'name') {
      orderBy = sortItem.desc ? desc(users.first_name) : asc(users.first_name);
    } else {
      const col = sortColumn(sortItem.id);
      orderBy = col ? (sortItem.desc ? desc(col) : asc(col)) : asc(users.id);
    }
  } else {
    orderBy = asc(users.id);
  }

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(users).where(where).orderBy(orderBy).limit(limit).offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(where)
  ]);

  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Users fetched from PostgreSQL',
    total_users: count,
    offset,
    limit,
    users: rows.map(serialize)
  };
}

export async function createUser(data: UserMutationPayload) {
  const [created] = await db
    .insert(users)
    .values({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      role: data.role as UserRole,
      status: data.status as (typeof users.$inferInsert)['status']
    })
    .returning();

  return { success: true, message: 'User created successfully', user: serialize(created) };
}

export async function updateUser(id: number, data: UserMutationPayload) {
  const [existing] = await db.select().from(users).where(eq(users.id, id));
  if (!existing) {
    return { success: false, message: `User with ID ${id} not found` };
  }

  const [updated] = await db
    .update(users)
    .set({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      role: data.role as UserRole,
      status: data.status as (typeof users.$inferInsert)['status'],
      updated_at: new Date()
    })
    .where(eq(users.id, id))
    .returning();

  return { success: true, message: 'User updated successfully', user: serialize(updated) };
}

export async function deleteUser(id: number) {
  const [existing] = await db.select().from(users).where(eq(users.id, id));
  if (!existing) {
    return { success: false, message: `User with ID ${id} not found` };
  }

  await db.delete(users).where(eq(users.id, id));

  return { success: true, message: 'User deleted successfully' };
}
