<p align="center">
  <img src="/public/tanstack-dashboard.png" alt="TanStack Start Dashboard Cover" style="max-width: 100%; border-radius: 8px;" />
</p>

<p align="center">
  <a href="https://github.com/togeziro/tanstack-dash/stargazers"><img src="https://img.shields.io/github/stars/togeziro/tanstack-dash?style=social" alt="GitHub stars" /></a>
  <a href="https://github.com/togeziro/tanstack-dash/network/members"><img src="https://img.shields.io/github/forks/togeziro/tanstack-dash?style=social" alt="Forks" /></a>
  <a href="https://github.com/togeziro/tanstack-dash/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/TanStack_Start-1.x-FF4154" alt="TanStack Start" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite" />
</p>

# TanStack Start Admin Dashboard

A production-ready **admin dashboard starter** built with **TanStack Start** (React 19 + Vite 7 + Nitro), **shadcn/ui**, **Tailwind CSS v4**, **Better Auth**, and **PostgreSQL (Drizzle ORM)**. It gives you charts, tables, forms, a kanban board, and a notification center behind a type-safe, feature-based codebase — ideal for SaaS apps, internal tools, and admin panels.

## Tech Stack

| Layer   | Technology                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Frontend (UI) | [React 19](https://react.dev), [TanStack Router](https://tanstack.com/router) (file-based, type-safe), [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev), [shadcn/ui](https://ui.shadcn.com), [Tailwind CSS v4](https://tailwindcss.com), [Recharts](https://recharts.org), [motion](https://motion.dev), [kbar](https://kbar.vercel.app/) |
| Middle (server runtime & data) | [TanStack Start](https://tanstack.com/start) on [Vite 7](https://vite.dev) + [Nitro](https://nitro.build), [TanStack React Query](https://tanstack.com/query) with SSR dehydration via `@tanstack/react-router-ssr-query`, `createServerFn()` RPC boundary, server-side prefetch via route `loader` + `ensureQueryData({ ssr: 'data-only' })`, [Better Auth](https://better-auth.com) session + RBAC middleware |
| Backend (data & persistence) | [PostgreSQL](https://www.postgresql.org) + [Drizzle ORM](https://orm.drizzle.team) (`postgres` driver), Better Auth DB-session store, server-only data-access layer with Zod-validated inputs and mapped DB errors, Nitro deploy presets (Vercel / Cloudflare / Node.js) |

## Full-Stack Architecture

The app is organized as three cooperating tiers so each concern stays isolated:

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8"/></svg> Frontend — what the browser runs
- <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8"/></svg> **React 19** components, server-rendered by TanStack Start and hydrated on the client.
- <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg> **TanStack Router** file-based routes with fully type-safe params and search state.
- <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h4"/></svg> **TanStack Form + Zod** for all forms (basic, multi-step, sheet/dialog, advanced).
- <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> **shadcn/ui + Tailwind CSS v4** for the component layer and theming (10+ themes via `tweakcn`).
- <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg> **TanStack Table** for sortable/filterable/paginated data tables driven by URL search params.
- <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4M7 9l4-4 4 4"/></svg> **Recharts** for the analytics overview; <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M6 12h.01M10 12h.01M14 12h.01M6 16h.01M10 16h.01M14 16h.01"/></svg> **kbar** for the Cmd+K command palette.

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg> Middle — server runtime & data glue
- **TanStack Start** (Vite 7 → Nitro) renders on the server and streams HTML. React Query cache is dehydrated into the page and rehydrated on the client via `setupRouterSsrQueryIntegration({ router, queryClient })`.
- **Route `loader`s** call `queryClient.ensureQueryData(...)` with `ssr: 'data-only'`, so data prefetches on the server and the client never refetches on first paint.
- **`createServerFn()`** is the RPC boundary for all server logic (products, users, kanban, notifications). Every endpoint enforces a valid session (`requireSession()`) or admin role (`requireRole('admin')`) **inside the handler**, so it cannot be reached unauthenticated over HTTP — independent of route guards.
- **Better Auth** provides the DB-session auth and `admin` plugin for RBAC; the `/api/auth/$` splat route handles all auth requests.

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" align="absmiddle"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg> Backend — data & persistence
- **PostgreSQL + Drizzle ORM** (`postgres` driver, server-only) is the source of truth for products, users, kanban, and notifications.
- **Better Auth schema** (`user`, `session`, `account`, `verification`) lives in the same Drizzle layer.
- **Server-only data-access modules** (`src/lib/db/`) dynamically `import()` the DB so the driver never reaches the client bundle. Inputs are Zod-validated at runtime; DB errors are mapped to safe messages (no column/constraint leakage).
- **Nitro** builds the app to any target (Vercel, Cloudflare Pages, Netlify, Node.js server).

## Features

- **Admin dashboard layout** (sidebar, header, content area)
- **Analytics overview** page with cards and Suspense-based independent loading
- **Data tables** with React Query route loaders, client-side cache, search, filter & pagination
- **Type-safe file-based routing** with TanStack Router (auto-generated route tree)
- **Server functions** via `createServerFn()` for server-side logic
- **Infobar component** to show helpful tips, status messages, or contextual info on any page
- **shadcn/ui components** with Tailwind CSS styling
- **Multi-theme support** with 10+ beautiful themes and easy theme switching
- **Feature-based folder structure** for scalable projects
- **Kanban board** with drag-n-drop (dnd-kit + PostgreSQL via Drizzle ORM)
- **Notification center** with bell icon badge, popover preview, and full page view (PostgreSQL-backed via Drizzle + React Query)
- **Command palette** (Cmd+K) for quick navigation
- **Better Auth** — DB-session auth with an `admin` role plugin, hardened RPC boundary (session + Zod + mapped errors)
- **Testing** — Vitest unit/integration tests + Playwright E2E tests for product CRUD and table sorting
- **Deploy anywhere** — Vercel, Cloudflare, Node.js via Nitro presets

## Pages

| Page | Description |
| :-------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| [Dashboard Overview](/dashboard/overview) | Cards with Recharts graphs. Suspense boundaries for independent loading/error per section. |
| [Product List (Table)](/dashboard/product) | TanStack Table + React Query (route loader prefetch + client cache) with URL search params for search, filter, pagination. |
| [Create Product Form](/dashboard/product/new) | TanStack Form + Zod with `useMutation` for create/update. Cache invalidation on success. |
| [Users (Table)](/dashboard/users) | Users table with React Query + URL state pattern. Same architecture as Products. |
| [React Query Demo](/dashboard/react-query) | Pokemon API showcase demonstrating route loader + `useSuspenseQuery` pattern with client-side cache. |
| [Kanban Board](/dashboard/kanban) | Drag n Drop task management board with dnd-kit, PostgreSQL-backed via Drizzle + React Query. Column sorting, task cards with priority badges. |
| [Notifications](/dashboard/notifications) | Notification center with bell icon badge, popover preview, and dedicated full page with tabs. |
| [Forms](/dashboard/forms/basic) | Basic, Multi-step, Sheet/Dialog, and Advanced form patterns with TanStack Form + Zod. |
| [Not Found](/notfound) | Custom 404 page via TanStack Router's `defaultNotFoundComponent`. |

## Feature-based Organization

```plaintext
src/
├── routes/                        # TanStack Router file-based routes
│   ├── __root.tsx                 # Root layout (providers, theme, HTML shell)
│   ├── index.tsx                  # Home (auth redirect)
│   ├── auth/                      # Auth pages (sign-in, sign-up)
│   ├── dashboard.tsx              # Dashboard layout (sidebar, header, kbar)
│   └── dashboard/                 # Dashboard pages
│       ├── overview.tsx           # Analytics with Suspense boundaries
│       ├── product/               # Product CRUD (route loaders + React Query)
│       ├── users.tsx              # Users table (route loaders + React Query)
│       ├── react-query.tsx        # React Query demo page
│       ├── kanban.tsx             # Task board page
│       ├── notifications.tsx      # Notifications page
│       ├── forms/                 # Form examples
│       └── elements/              # UI showcase
│
├── components/                    # Shared components
│   ├── ui/                        # UI primitives (buttons, inputs, kanban, etc.)
│   ├── layout/                    # Layout components (header, sidebar, etc.)
│   ├── themes/                    # Theme system (selector, mode toggle, config)
│   └── kbar/                      # Command+K interface
│
├── features/                      # Feature-based modules
│   ├── overview/                  # Dashboard analytics (charts, cards)
│   ├── products/                  # Product listing, form, tables (React Query)
│   ├── users/                     # User management table (React Query)
│   ├── react-query-demo/          # React Query demo (Pokemon API)
│   ├── kanban/                    # Drag-drop task board
│   ├── notifications/             # Notification center (React Query + PostgreSQL)
│   ├── auth/                      # Auth components
│   └── forms/                     # Form showcases
│
├── lib/                           # Core utilities (query-client, parsers, etc.)
│   ├── auth/                     # Better Auth client + server config + permissions
│   └── db/                        # Drizzle ORM connection, schema, server-only data access
├── hooks/                         # Custom hooks (use-data-table, use-media-query, etc.)
├── config/                        # Navigation, infobar, data table config
├── constants/                     # Option constants, seed patterns & faker fallbacks
├── styles/                        # Global CSS & theme files
│   └── themes/                    # Individual theme CSS files (OKLCH)
└── types/                         # TypeScript types
```

## Getting Started

> This admin dashboard starter uses **TanStack Start** with **React 19**, **Vite 7**, **Better Auth**, **PostgreSQL + Drizzle**, and **shadcn/ui**. Follow these steps to run it locally:

Clone the repo:

```bash
git clone git@github.com:togeziro/tanstack-dash.git
cd tanstack-dash
```

Install dependencies and run:

```bash
bun install
bun run prepare     # activate pre-commit hooks
cp env.example.txt .env
```

Set up and seed the PostgreSQL database (ensure you have PostgreSQL running locally):

```bash
bun run db:migrate  # apply database migrations
bun run db:seed      # seed products, kanban board, notifications, and a demo admin user
```

Run the development server:

```bash
bun run dev
```

You should now be able to access the application at http://localhost:3000.

Log in with the seeded demo account: **`admin@example.com`** / **`Password123!`** (Better Auth `admin` role).

### Testing

```bash
bun run test:run       # Vitest unit/integration tests
bun run e2e            # Playwright E2E tests (auto-starts dev server)
```

## Deploy

### Vercel (Recommended)

The project uses **Nitro** with the `vercel` preset. Just connect your GitHub repo to Vercel:

- **Build Command:** `bun run build`
- **Output Directory:** leave blank (auto-detected)
- **Framework Preset:** Other

### Other Platforms

Change the Nitro preset in `vite.config.ts`:

```ts
// Cloudflare Pages
nitro({ preset: 'cloudflare-pages' });

// Node.js server
nitro({ preset: 'node-server' });

// Netlify
nitro({ preset: 'netlify' });
```

Then run locally with:

```bash
bun run build
bun run start
```

## Security

The server-function RPC boundary is hardened (auth at the boundary, Zod input validation, mapped DB errors). For the full details and the one known gap (notification IDOR — tracked, not yet fixed), see [docs/SECURITY.md](./docs/SECURITY.md).

## Key Differences from upstream (Kiranism fork → ours)

| Concept | Upstream (Next.js roots) | This fork (TanStack Start) |
| ------- | --------------------------- | ----------------------------- |
| Framework | Next.js App Router | **TanStack Start** (React 19 + Vite 7 + Nitro) |
| Auth | Next.js patterns | **Better Auth** (DB sessions, `admin` RBAC) |
| Database | (template default) | **PostgreSQL + Drizzle ORM** |
| Routing | `app/` | File-based (`routes/`) with type-safe params |
| Data Fetching | Server Components + `HydrationBoundary` | Route `loader` (`ensureQueryData`) dehydrated via `@tanstack/react-router-ssr-query`, consumed with `useQuery` / `useSuspenseQuery` |
| Layouts | `layout.tsx` nesting | Layout routes with `<Outlet />` |
| Server Code | `'use server'` actions | `createServerFn()` |
| Build Tool | Webpack/Turbopack | Vite |
| Deployment | `next start` | Nitro (any platform) |
| URL State | nuqs | TanStack Router `useSearch()` + `validateSearch` |

### Support

If you find this template helpful, please consider giving it a star — and if you are deciding between the original and this fork, **we recommend using this one** for the complete backend and test coverage.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow?style=flat-square&logo=buymeacoffee)](https://buymeacoffee.com/kir4n)

Cheers!

---

<p align="center">
  <sub>Forked from <a href="https://github.com/Kiranism/tanstack-start-dashboard">Kiranism/tanstack-start-dashboard</a>. Maintained fork with Better Auth + PostgreSQL backend and a hardened, tested codebase.</sub>
</p>

<!--
SEO keywords:

tanstack start dashboard, tanstack start admin template, vite dashboard template,
shadcn ui dashboard, admin dashboard starter, tanstack router, typescript dashboard,
dashboard ui template, react admin dashboard, tailwind css admin dashboard,
tanstack start shadcn admin panel, better auth dashboard, drizzle orm postgresql dashboard
-->
