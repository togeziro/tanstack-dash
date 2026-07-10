import { desc, eq } from 'drizzle-orm';
import { db } from './index';
import { notifications } from './schema/notifications';
import type { NotificationAction } from '@/components/ui/notification-card';

export type NotificationRow = {
  id: string;
  title: string;
  body: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  actions?: NotificationAction[];
};

function toNotification(row: typeof notifications.$inferSelect): NotificationRow {
  return {
    id: String(row.id),
    title: row.title,
    body: row.body,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    actions: row.actions ?? undefined
  };
}

export async function getNotifications(): Promise<NotificationRow[]> {
  const rows = await db.select().from(notifications).orderBy(desc(notifications.created_at));
  return rows.map(toNotification);
}

export async function markAsRead(id: number) {
  await db
    .update(notifications)
    .set({ status: 'read', updated_at: new Date() })
    .where(eq(notifications.id, id));
}

export async function markAllAsRead() {
  await db
    .update(notifications)
    .set({ status: 'read', updated_at: new Date() })
    .where(eq(notifications.status, 'unread'));
}

export async function addNotification(data: {
  title: string;
  body: string;
  actions?: NotificationAction[];
}) {
  const [created] = await db
    .insert(notifications)
    .values({
      title: data.title,
      body: data.body,
      actions: data.actions ?? null
    })
    .returning();

  if (!created) {
    throw new Error('Failed to create notification');
  }

  return toNotification(created);
}

export async function removeNotification(id: number) {
  await db.delete(notifications).where(eq(notifications.id, id));
}
