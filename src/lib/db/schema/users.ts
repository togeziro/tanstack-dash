import { pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', ['Active', 'Inactive', 'Invited']);

export const userRoleEnum = pgEnum('user_role', [
  'Developer',
  'Designer',
  'Manager',
  'QA',
  'DevOps',
  'Product Owner'
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash'),
  phone: text('phone'),
  status: userStatusEnum('status').notNull().default('Active'),
  role: userRoleEnum('role').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
