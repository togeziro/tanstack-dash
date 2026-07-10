import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { getUsers, createUser, updateUser, deleteUser } from './users';
import { resetDatabase, seedUsers } from '@/test-utils/db';
import { db } from '@/lib/db';
import { users } from './schema/users';

async function allUsers() {
  return db.select().from(users).orderBy(users.id);
}

describe('users data access (integration)', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedUsers([
      {
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@x.com',
        role: 'Developer',
        status: 'Active'
      },
      {
        first_name: 'Grace',
        last_name: 'Hopper',
        email: 'grace@x.com',
        role: 'Manager',
        status: 'Inactive'
      },
      {
        first_name: 'Alan',
        last_name: 'Turing',
        email: 'alan@x.com',
        role: 'Developer',
        status: 'Invited'
      },
      {
        first_name: 'Katherine',
        last_name: 'Johnson',
        email: 'kat@x.com',
        role: 'QA',
        status: 'Active'
      }
    ]);
  });

  afterAll(async () => {
    await resetDatabase();
  });

  it('lists users with pagination metadata', async () => {
    const res = await getUsers({ page: 1, limit: 10 });
    expect(res.success).toBe(true);
    expect(res.total_users).toBe(4);
    expect(res.users).toHaveLength(4);
  });

  it('filters by a single role', async () => {
    const res = await getUsers({ roles: 'Developer' });
    expect(res.total_users).toBe(2);
    expect(res.users.every((u) => u.role === 'Developer')).toBe(true);
  });

  it('filters by multiple roles', async () => {
    const res = await getUsers({ roles: 'Manager,QA' });
    expect(res.total_users).toBe(2);
  });

  it('searches across first name, last name and email', async () => {
    expect((await getUsers({ search: 'Grace' })).total_users).toBe(1);
    expect((await getUsers({ search: 'Hopper' })).total_users).toBe(1);
    expect((await getUsers({ search: 'alan@x.com' })).total_users).toBe(1);
  });

  it('sorts by first name', async () => {
    const res = await getUsers({ sort: JSON.stringify([{ id: 'first_name', desc: false }]) });
    expect(res.users.map((u) => u.first_name)).toEqual(['Ada', 'Alan', 'Grace', 'Katherine']);
  });

  it('sorts by the combined "name" field via first name', async () => {
    const res = await getUsers({ sort: JSON.stringify([{ id: 'name', desc: true }]) });
    expect(res.users[0].first_name).toBe('Katherine');
  });

  it('serializes dates to ISO strings', async () => {
    const res = await getUsers({});
    expect(res.users[0].created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('creates a user', async () => {
    const res = await createUser({
      first_name: 'Edsger',
      last_name: 'Dijkstra',
      email: 'ed@x.com',
      phone: '555-0000',
      role: 'DevOps',
      status: 'Active'
    });
    expect(res.success).toBe(true);
    expect(res.user!.email).toBe('ed@x.com');
    expect(await allUsers()).toHaveLength(5);
  });

  it('updates a user', async () => {
    const [user] = await allUsers();
    const res = await updateUser(user.id, {
      first_name: 'Augusta',
      last_name: 'Ada',
      email: user.email,
      phone: '555-9999',
      role: 'Manager',
      status: 'Inactive'
    });
    expect(res.success).toBe(true);
    expect(res.user!.first_name).toBe('Augusta');
    expect(res.user!.role).toBe('Manager');
  });

  it('fails to update a missing user', async () => {
    const res = await updateUser(999_999, {
      first_name: 'X',
      last_name: 'Y',
      email: 'z@x.com',
      phone: '1',
      role: 'QA',
      status: 'Active'
    });
    expect(res.success).toBe(false);
  });

  it('deletes a user', async () => {
    const [user] = await allUsers();
    const res = await deleteUser(user.id);
    expect(res.success).toBe(true);
    expect(await allUsers()).toHaveLength(3);
  });

  it('fails to delete a missing user', async () => {
    const res = await deleteUser(999_999);
    expect(res.success).toBe(false);
    expect(await allUsers()).toHaveLength(4);
  });
});
