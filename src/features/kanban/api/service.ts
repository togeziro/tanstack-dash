import { createServerFn } from '@tanstack/react-start';
import type { AddTaskPayload, MoveTaskPayload } from './types';

function validateAddTask(data: unknown): AddTaskPayload {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }
  const obj = data as Record<string, unknown>;
  if (typeof obj.title !== 'string' || obj.title.trim().length === 0) {
    throw new Error('Title is required and must be a non-empty string');
  }
  if (obj.description !== undefined && typeof obj.description !== 'string') {
    throw new Error('Description must be a string');
  }
  return { title: obj.title.trim(), description: obj.description ?? undefined };
}

function validateMoveTask(data: unknown): MoveTaskPayload {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }
  const obj = data as Record<string, unknown>;
  const taskId = Number(obj.taskId);
  if (!Number.isFinite(taskId) || taskId <= 0) {
    throw new Error('taskId must be a positive number');
  }
  if (typeof obj.columnSlug !== 'string' || obj.columnSlug.trim().length === 0) {
    throw new Error('columnSlug is required');
  }
  const position = Number(obj.position);
  if (!Number.isInteger(position) || position < 0) {
    throw new Error('position must be a non-negative integer');
  }
  return { taskId, columnSlug: obj.columnSlug.trim(), position };
}

export const getBoardFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { getBoard } = await import('@/lib/db/kanban');
  return getBoard();
});

export const addTaskFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    validateAddTask(data);
    return data as AddTaskPayload;
  })
  .handler(async ({ data }) => {
    const { addTask } = await import('@/lib/db/kanban');
    return addTask(data.title, data.description);
  });

export const moveTaskFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    validateMoveTask(data);
    return data as MoveTaskPayload;
  })
  .handler(async ({ data }) => {
    const { moveTask } = await import('@/lib/db/kanban');
    return moveTask(data.taskId, data.columnSlug, data.position);
  });
