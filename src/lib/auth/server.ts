import { createServerFn } from '@tanstack/react-start';
import { SignJWT, jwtVerify } from 'jose';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().default(false)
});

const signUpSchema = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.toLowerCase().trim()),
  password: z.string().min(6),
  first_name: z
    .string()
    .min(1)
    .transform((s) => s.trim()),
  last_name: z
    .string()
    .min(1)
    .transform((s) => s.trim())
});

function getJWTSecret(): Uint8Array {
  if (!process.env.AUTH_SECRET) {
    throw new Error('AUTH_SECRET is not set');
  }
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

function getCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAge ?? 60 * 60 * 24 * 30
  };
}

function createToken(userId: string, email: string) {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getJWTSecret());
}

type UserShape = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
};

function serializeUser(row: {
  id: unknown;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: unknown;
}): UserShape {
  return {
    id: String(row.id),
    email: row.email,
    first_name: row.first_name ?? '',
    last_name: row.last_name ?? '',
    role: String(row.role)
  };
}

export const signInUserFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => signInSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { setCookie } = await import('@tanstack/react-start/server');
      const { eq } = await import('drizzle-orm');
      const bcrypt = await import('bcryptjs');
      const { db } = await import('@/lib/db');
      const { users } = await import('@/lib/db/schema/users');

      const email = data.email.toLowerCase().trim();

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user || !user.password_hash) {
        return { success: false as const, message: 'Invalid email or password' };
      }

      const valid = await bcrypt.compare(data.password, user.password_hash);
      if (!valid) {
        return { success: false as const, message: 'Invalid email or password' };
      }

      const token = await createToken(String(user.id), user.email);
      const maxAge = data.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

      setCookie('auth_token', token, getCookieOptions(maxAge));

      return {
        success: true as const,
        user: serializeUser(user)
      };
    } catch (err) {
      console.error('signInUserFn error:', err);
      return { success: false as const, message: 'Authentication failed' };
    }
  });

export const signUpUserFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => signUpSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { setCookie } = await import('@tanstack/react-start/server');
      const bcrypt = await import('bcryptjs');
      const { db } = await import('@/lib/db');
      const { users } = await import('@/lib/db/schema/users');

      const password_hash = await bcrypt.hash(data.password, 12);

      const [created] = await db
        .insert(users)
        .values({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password_hash,
          role: 'Developer'
        })
        .returning();

      const token = await createToken(String(created.id), created.email);

      setCookie('auth_token', token, getCookieOptions());

      return {
        success: true as const,
        user: serializeUser(created)
      };
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === '23505'
      ) {
        return { success: false as const, message: 'Email already in use' };
      }
      console.error('signUpUserFn error:', err);
      return { success: false as const, message: 'Registration failed' };
    }
  });

export const getSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { getCookie } = await import('@tanstack/react-start/server');
    const { db } = await import('@/lib/db');
    const { users } = await import('@/lib/db/schema/users');

    const token = getCookie('auth_token');
    if (!token) return { user: null };

    const { payload } = await jwtVerify(token, getJWTSecret());
    if (!payload.sub) return { user: null };

    const [user] = await db
      .select()
      .from(users)
      .where(sql`${users.id}::text = ${payload.sub}`)
      .limit(1);

    if (!user) return { user: null };

    return { user: serializeUser(user) };
  } catch {
    return { user: null };
  }
});

export const signOutUserFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { setCookie } = await import('@tanstack/react-start/server');
  setCookie('auth_token', '', { ...getCookieOptions(), maxAge: 0 });
  return { success: true as const };
});
