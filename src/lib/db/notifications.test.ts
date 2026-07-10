import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  addNotification,
  removeNotification
} from './notifications';
import { resetDatabase } from '@/test-utils/db';
import { db } from '@/lib/db';
import { notifications } from './schema/notifications';

describe('notifications data access (integration)', () => {
  beforeEach(async () => {
    await resetDatabase();

    await db.insert(notifications).values([
      {
        title: 'Welcome',
        body: 'Welcome to the dashboard',
        status: 'unread',
        actions: [{ id: 'view', label: 'Get started', type: 'redirect', style: 'primary' }]
      },
      {
        title: 'Old alert',
        body: 'This was already read',
        status: 'read',
        actions: null
      }
    ]);
  });

  afterAll(async () => {
    await resetDatabase();
  });

  it('returns all notifications ordered by created_at descending', async () => {
    const rows = await getNotifications();
    expect(rows).toHaveLength(2);

    // most recent first
    const t0 = new Date(rows[0].createdAt).getTime();
    const t1 = new Date(rows[1].createdAt).getTime();
    expect(t0).toBeGreaterThanOrEqual(t1);
  });

  it('returns notifications with the correct shape', async () => {
    const rows = await getNotifications();
    const welcome = rows.find((n) => n.title === 'Welcome')!;
    expect(welcome).toMatchObject({
      id: expect.any(String),
      title: 'Welcome',
      body: 'Welcome to the dashboard',
      status: 'unread',
      actions: expect.arrayContaining([
        expect.objectContaining({ id: 'view', label: 'Get started' })
      ])
    });
  });

  it('marks a single notification as read', async () => {
    const [{ id }] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.title, 'Welcome'))
      .limit(1);

    await markAsRead(id);

    const rows = await getNotifications();
    const updated = rows.find((n) => n.id === String(id))!;
    expect(updated.status).toBe('read');
  });

  it('marks all unread notifications as read', async () => {
    await markAllAsRead();

    const rows = await getNotifications();
    for (const n of rows) {
      expect(n.status).toBe('read');
    }
  });

  it('adds a new notification and returns it', async () => {
    const created = await addNotification({
      title: 'Test notification',
      body: 'This was added via the data layer',
      actions: [{ id: 'open', label: 'View', type: 'redirect', style: 'primary' }]
    });

    expect(created.title).toBe('Test notification');
    expect(created.status).toBe('unread');
    expect(created.id).toEqual(expect.any(String));

    const all = await getNotifications();
    expect(all).toHaveLength(3);
  });

  it('removes a notification by id', async () => {
    const rows = await getNotifications();
    const target = rows.find((n) => n.title === 'Old alert')!;

    await removeNotification(Number(target.id));

    const all = await getNotifications();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Welcome');
  });

  it('handles removing a non-existent id without error', async () => {
    await expect(removeNotification(999_999)).resolves.not.toThrow();
  });
});
