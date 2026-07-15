import { createMiddleware, createServerFn } from '@tanstack/react-start';

export async function requireSession() {
  const { auth } = await import('./auth');
  const { getRequestHeaders } = await import('@tanstack/react-start/server');
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export const ensureSession = createServerFn({ method: 'GET' }).handler(async () => {
  return requireSession();
});

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await requireSession();
  return next({
    context: {
      session
    }
  });
});
