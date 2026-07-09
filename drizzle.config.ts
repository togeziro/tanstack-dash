import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema/*',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL || 'postgres://tanstack:tanstack@localhost:5432/tanstack_dashboard'
  }
});
