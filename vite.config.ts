import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    allowedHosts: true
  },
  plugins: [tsconfigPaths(), tailwindcss(), tanstackStart(), viteReact()],
  test: {
    // Integration tests talk to a dedicated PostgreSQL test database
    // (see scripts/create-test-db.ts). Never point this at the dev DB.
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgres://tanstack:tanstack@localhost:5432/tanstack_dashboard_test'
    },
    globals: true,
    environment: 'node',
    // Run all test files in a single worker so they don't race against each
    // other on the shared test database (each file truncates/reseeds in
    // beforeEach). Tests within a file already run sequentially.
    maxWorkers: 1,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.output/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/features/**/schemas/**', 'src/features/**/api/**']
    }
  }
});
