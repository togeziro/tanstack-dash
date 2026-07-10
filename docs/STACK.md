# TanStack Dashboard — Tech Stack

## Meta-Framework & Core

| Technology            | Version          | Purpose                    |
| --------------------- | ---------------- | -------------------------- |
| TanStack Start        | v1.168.27        | Full-stack meta-framework  |
| React                 | v19.0.0          | UI library                 |
| Vite                  | v7.0.2           | Build tool / dev server    |
| Nitro                 | v3.0.260415-beta | Server engine / deployment |
| TypeScript            | v5.7.2           | Language                   |
| bun (package manager) | —                | Package manager            |

## Routing & Data Fetching

| Technology                        | Version   | Purpose                          |
| --------------------------------- | --------- | -------------------------------- |
| TanStack Router                   | v1.170.17 | File-based type-safe routing     |
| TanStack Router DevTools          | v1.167.0  | Route dev tools                  |
| TanStack React Query              | v5.101.2  | Server state / data fetching     |
| TanStack React Query DevTools     | v5.101.2  | Query dev tools                  |
| @tanstack/react-router-with-query | v1.130.17 | Router + Query bridge            |
| @tanstack/router-plugin           | v1.168.19 | Vite plugin for route generation |
| @tanstack/zod-adapter             | v1.167.0  | Zod validation for route params  |

## UI Components

| Technology               | Version  | Purpose                         |
| ------------------------ | -------- | ------------------------------- |
| shadcn/ui (new-york)     | —        | 60+ UI primitives               |
| Radix UI                 | —        | 18 headless UI primitives       |
| @radix-ui/react-icons    | v1.3.2   | Icon set                        |
| class-variance-authority | v0.7.1   | Component variant definitions   |
| clsx                     | v2.1.1   | Conditional class names         |
| tailwind-merge           | v3.5.0   | Tailwind class merging          |
| cmdk                     | v1.1.1   | Command menu primitive          |
| vaul                     | v1.1.2   | Drawer component                |
| sonner                   | v1.7.4   | Toast notifications             |
| input-otp                | v1.4.2   | OTP input                       |
| react-resizable-panels   | v2.1.9   | Resizable panels                |
| motion                   | v11.18.2 | Animations (Framer Motion v11+) |

## Forms & Validation

| Technology       | Version | Purpose               |
| ---------------- | ------- | --------------------- |
| TanStack Form    | v1.33.0 | Form state management |
| Zod              | v4.3.6  | Schema validation     |
| react-dropzone   | v14.4.1 | File upload           |
| react-day-picker | v9.14.0 | Date picker           |

## State Management

| Technology           | Version  | Purpose                                |
| -------------------- | -------- | -------------------------------------- |
| TanStack React Query | v5.101.2 | Server state (products, users, kanban, notifications) |

## Tables & Charts

| Technology     | Version | Purpose                                      |
| -------------- | ------- | -------------------------------------------- |
| TanStack Table | v8.21.3 | Data tables (sorting, filtering, pagination) |
| Recharts       | v2.15.4 | Charts (area, bar, pie)                      |
| date-fns       | v4.1.0  | Date formatting                              |

## Styling & Themes

| Technology        | Version | Purpose                            |
| ----------------- | ------- | ---------------------------------- |
| Tailwind CSS      | v4.2.2  | Utility-first CSS                  |
| @tailwindcss/vite | v4.2.2  | Tailwind Vite plugin               |
| tw-animate-css    | v1.4.0  | CSS animation utilities            |
| next-themes       | v0.4.6  | Theme provider (dark/light/system) |

## Fonts

| Font                      | Source                                       |
| ------------------------- | -------------------------------------------- |
| Geist Sans                | @fontsource/geist-sans v5.2.5                |
| Geist Mono                | @fontsource/geist-mono v5.2.7                |
| Inter Variable            | @fontsource-variable/inter v5.1.2            |
| DM Sans Variable          | @fontsource-variable/dm-sans v5.1.3          |
| Instrument Sans Variable  | @fontsource-variable/instrument-sans v5.1.1  |
| Mulish Variable           | @fontsource-variable/mulish v5.1.2           |
| Outfit Variable           | @fontsource-variable/outfit v5.1.2           |
| Playfair Display Variable | @fontsource-variable/playfair-display v5.1.2 |
| Fira Code Variable        | @fontsource-variable/fira-code v5.1.2        |
| JetBrains Mono Variable   | @fontsource-variable/jetbrains-mono v5.1.3   |
| Noto Sans Mono Variable   | @fontsource-variable/noto-sans-mono v5.1.2   |
| Merriweather              | @fontsource/merriweather v5.1.3              |
| Space Mono                | @fontsource/space-mono v5.0.20               |
| Architects Daughter       | @fontsource/architects-daughter v5.0.17      |

## Drag & Drop

| Technology         | Version | Purpose               |
| ------------------ | ------- | --------------------- |
| @dnd-kit/core      | v6.3.1  | Kanban drag-and-drop  |
| @dnd-kit/modifiers | v9.0.0  | Movement restrictions |
| @dnd-kit/sortable  | v10.0.0 | Sortable columns      |
| @dnd-kit/utilities | v3.2.2  | Drag utilities        |

## Command Palette

| Technology | Version        | Purpose               |
| ---------- | -------------- | --------------------- |
| kbar       | v0.1.0-beta.48 | Cmd+K command palette |

## Icons

| Technology            | Version | Purpose           |
| --------------------- | ------- | ----------------- |
| @tabler/icons-react   | v3.40.0 | 175+ icons        |
| @radix-ui/react-icons | v1.3.2  | Calendar chevrons |

## Mock Data

| Technology      | Version | Purpose              |
| --------------- | ------- | -------------------- |
| @faker-js/faker | v9.9.0  | Seed data generation |
| match-sorter    | v8.2.0  | Fuzzy filtering      |
| sort-by         | v1.2.0  | Array sorting        |
| uuid            | v11.1.0 | ID generation        |

## Database & ORM

| Technology  | Version  | Purpose                  |
| ----------- | -------- | ------------------------ |
| PostgreSQL  | 17       | Relational database      |
| drizzle-orm | v0.45.2  | Type-safe SQL ORM        |
| postgres    | v3.4.9   | PostgreSQL driver        |
| drizzle-kit | v0.31.10 | Schema migrations / push |

## Testing

| Technology           | Version | Purpose                                       |
| -------------------- | ------- | --------------------------------------------- |
| Vitest               | v4.1.10  | Unit & integration test runner               |
| @testing-library/react     | v16.3.2 | React component testing              |
| @testing-library/jest-dom  | v6.9.1  | DOM-specific matchers               |
| @testing-library/user-event| v14.6.1 | User interaction simulation         |
| jsdom                | v29.1.1 | DOM environment for Vitest                   |
| Playwright           | v1.61.1 | End-to-end browser tests (Chromium)           |

## Linting & Formatting

| Technology | Version | Purpose              |
| ---------- | ------- | -------------------- |
| oxlint     | v1.59.0 | Rust-based linter    |
| oxfmt      | v0.44.0 | Rust-based formatter |

## Quality & Tooling

| Technology       | Version | Purpose                                |
| ---------------- | ------- | -------------------------------------- |
| simple-git-hooks | 2.13.1  | Git hook manager (pre-commit)          |
| lint-staged      | 17.0.8  | Run linters/formatters on staged files |

Pre-commit hook runs: `oxlint` → `oxfmt --check` → `tsc --noEmit` on every commit.

## Deployment

| Technology                    | Notes                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| TanStack Start (built-in SSR) | Dev server handles SSR internally via Vite environments                                                                                   |
| Nitro (package)               | Available for production builds. Remove `nitro/vite` plugin from Vite config in dev mode — conflicts with TanStack Start's SSR middleware |
| bun                           | Runtime & package manager                                                                                                                 |

## Other Utilities

| Technology       | Version | Purpose                            |
| ---------------- | ------- | ---------------------------------- |
| react-responsive | v10.0.1 | Media query component              |
| AGENTS.md        | —       | Dev conventions (see project root) |
