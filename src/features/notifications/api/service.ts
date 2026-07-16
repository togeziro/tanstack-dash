import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import { requireSession } from '@/lib/auth/session';
import { markAsReadSchema, removeNotificationSchema, addNotificationSchema } from './validation';
import type { AddNotificationPayload } from './types';

export const getNotificationsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireSession();
  const { getNotifications } = await import('@/lib/db/notifications');
  return getNotifications();
});

export const markAsReadFn = createServerFn({ method: 'POST' })
  .validator(markAsReadSchema)
  .handler(async ({ data: { id } }) => {
    await requireSession();
    const { markAsRead } = await import('@/lib/db/notifications');
    await markAsRead(id);
    return { success: true };
  });

export const markAllAsReadFn = createServerFn({ method: 'POST' }).handler(async () => {
  await requireSession();
  const { markAllAsRead } = await import('@/lib/db/notifications');
  await markAllAsRead();
  return { success: true };
});

export const addNotificationFn = createServerFn({ method: 'POST' })
  .validator(addNotificationSchema)
  .handler(async ({ data }: { data: AddNotificationPayload }) => {
    await requireSession();
    const { addNotification } = await import('@/lib/db/notifications');
    return addNotification(data);
  });

export const removeNotificationFn = createServerFn({ method: 'POST' })
  .validator(removeNotificationSchema)
  .handler(async ({ data: { id } }) => {
    await requireSession();
    const { removeNotification } = await import('@/lib/db/notifications');
    await removeNotification(id);
    return { success: true };
  });
