import { createServerFn } from '@tanstack/react-start';
import type { AddNotificationPayload } from './types';

export const getNotificationsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { getNotifications } = await import('@/lib/db/notifications');
  return getNotifications();
});

export const markAsReadFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid request body');
    }
    const obj = data as Record<string, unknown>;
    const id = Number(obj.id);
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('id must be a positive number');
    }
    return { id };
  })
  .handler(async ({ data }) => {
    const { markAsRead } = await import('@/lib/db/notifications');
    await markAsRead(data.id);
    return { success: true };
  });

export const markAllAsReadFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { markAllAsRead } = await import('@/lib/db/notifications');
  await markAllAsRead();
  return { success: true };
});

export const addNotificationFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid request body');
    }
    const obj = data as Record<string, unknown>;
    if (typeof obj.title !== 'string' || obj.title.trim().length === 0) {
      throw new Error('title is required');
    }
    if (typeof obj.body !== 'string' || obj.body.trim().length === 0) {
      throw new Error('body is required');
    }
    return data as AddNotificationPayload;
  })
  .handler(async ({ data }) => {
    const { addNotification } = await import('@/lib/db/notifications');
    return addNotification(data);
  });

export const removeNotificationFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid request body');
    }
    const obj = data as Record<string, unknown>;
    const id = Number(obj.id);
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('id must be a positive number');
    }
    return { id };
  })
  .handler(async ({ data }) => {
    const { removeNotification } = await import('@/lib/db/notifications');
    await removeNotification(data.id);
    return { success: true };
  });
