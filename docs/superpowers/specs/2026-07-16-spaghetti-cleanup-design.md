# Spaghetti-Code Cleanup — Design

**Date:** 2026-07-16
**Status:** Approved
**Scope:** All 10 audit findings, including demo/showcase code in `features/forms/`

## Goal

Reduce maintainability debt in `src/` by removing duplication, splitting
over-large single-responsibility-violating modules, and deleting dead code.
This is a **refactoring-only** change set — no behavior, UI, or API surface
changes. Each pass is independently commit-safe and reversible.

## Audit Summary

The codebase is already well-structured (modular feature folders, validation
separated into `validation.ts`, isolated DB layer). The cleanup targets
specific duplications and a few long files rather than a rewrite.

### Findings by severity

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | HIGH | Duplicated auth page shells (v1 + v2 sign-in/sign-up) | `features/auth/components/sign-in-view.tsx`, `sign-up-view.tsx`, `routes/auth/v2/sign-in/index.tsx`, `routes/auth/v2/sign-up/index.tsx` |
| 2 | HIGH | Product schema + category options redefined in 3 form files; `as any` cast hides drift; demo category values lowercase vs DB enum uppercase (latent bug) | `features/forms/components/multi-step-product-form.tsx:16`, `sheet-product-form.tsx:25,44`, `sheet-form-demo.tsx:47` |
| 3 | HIGH | `github-stars-button.tsx` is an async Server Component that fetches GitHub REST on every render, with no Suspense/error UI, and packs fetch + formatCount + icon + cva into one file | `components/github-stars-button.tsx` |
| 4 | MEDIUM | Dead `useEffect` (empty body) + unused `useMediaQuery` result in `app-sidebar.tsx` | `components/layout/app-sidebar.tsx:40` |
| 5 | MEDIUM | `infobar.tsx` 755-line god file: provider + context + ~25 sub-components | `components/ui/infobar.tsx` |
| 6 | MEDIUM | Repeated AppField/aria-invalid boilerplate across auth forms | `features/auth/components/register-form.tsx`, `user-auth-form.tsx`, `features/forms/components/sheet-product-form.tsx` |
| 7 | MEDIUM | `use-data-table.ts` 282-line hook does filter/sort/pagination/URL-sync at once; duplicated separator-split logic vs `lib/parsers.ts` | `hooks/use-data-table.ts` |
| 8 | LOW | `demo-form.tsx` 826-line component with inline custom fields | `components/forms/demo-form.tsx` |
| 9 | LOW | Duplicated "clear filter" trigger button in 3 vendored table components | `components/ui/data-table-faceted-filter.tsx`, `data-table-date-filter.tsx`, `data-table-slider-filter.tsx` |
| 10 | LOW | Repeated load-row-404 preamble in `db/products.ts` | `lib/db/products.ts` |

## Architecture / Execution Plan

Work is organized into 4 isolated passes. Each pass must keep existing tests
green and (where applicable) pass E2E before merge.

### Pass A — Auth Layout Deduplication

- Create `src/features/auth/components/auth-shell.tsx` exporting `<AuthShell>`
  with `title`, `subtitle`, `footerLink` props, rendering the split-screen
  layout + Google button + divider + footer block.
- Update `sign-in-view.tsx` and `sign-up-view.tsx` to use `<AuthShell>`.
- Create a shared `<AuthCard>` for the v2 routes (`routes/auth/v2/sign-in`,
  `routes/auth/v2/sign-up`) that holds the common "Or continue with" divider,
  footer copyright block, and top link.
- Verifies with Playwright E2E (auth routes change).

### Pass B — Product Schema + Category Deduplication (incl. demos)

- Import the canonical `productSchema` from `features/products/schemas/`
  into `multi-step-product-form.tsx` and `sheet-product-form.tsx`. Derive
  step schemas via `.pick(...)`.
- Import `categoryOptions` from `features/products/constants/product-options.ts`
  everywhere. Fix the lowercase (`'electronics'`) vs uppercase (`'Electronics'`)
  enum mismatch in the demo forms by using the canonical constants — this is a
  latent bug fix.
- Remove the inline `productSchema` redefinition + `as any` cast in
  `sheet-product-form.tsx`.
- Rename any intentionally-toy demo schema to `demoProductSchema` to avoid
  confusion with the production schema.
- Verifies with Playwright E2E (product form changes).

### Pass C — GitHub Stars Button Cleanup

- Move `fetchGitHubRepo` and `formatCount` into `src/lib/github.ts`.
- Extract `GitHubIcon` into `components/icons.tsx`.
- Wrap the button usage site with React `<Suspense>` so the loading state is
  explicit (avoids unbounded render-time fetch with no fallback).
- The button component itself stays in `components/`.

### Pass D — Remaining Cleanup

| # | Finding | Fix |
|---|---------|-----|
| 4 | Dead useEffect in `app-sidebar.tsx` | Delete the empty `useEffect` and unused `useMediaQuery` call |
| 5 | `infobar.tsx` 755-line god file | Split into `infobar-context.tsx` (provider + hook + types), `infobar.tsx` (sidebar shell), `infobar-sheet.tsx` (mobile), `infobar-menu.tsx` (menu/group parts) |
| 6 | Repeated AppField boilerplate in auth forms | Use existing `FormTextField`/`PasswordInput` components; collapse repeated `<field.FieldSet><field.Field>…<field.FieldError>` scaffold into one `TextField` wrapper |
| 7 | `use-data-table.ts` does too much | Extract pure helpers `parseFiltersFromSearch`, `buildFilterSearchParams`, `parseSorting`/`serializeSorting`; remove duplicate separator logic vs `lib/parsers.ts` |
| 8 | `demo-form.tsx` inline custom fields | Extract `ComboboxField`, `TagsField`, `SectionTitle` into `components/forms/fields/` |
| 9 | Duplicated "clear filter" trigger | Create shared `<FilterTrigger>` used by the 3 vendored table filter components |
| 10 | Repeated load-row-404 preamble in `db/products.ts` | Add `getProductOr404(id)` helper used by `updateProduct` and `deleteProduct` |

## Testing Strategy

- Run unit tests (`bun run test`) after every pass.
- Run Playwright E2E (`bun run test:e2e`) after Pass A (auth) and Pass B
  (product forms).
- No new tests required — existing tests are the safety net for this
  no-behavior-change refactor.
- Run `bun run lint` and `bun run typecheck` (pre-commit hooks) per pass.

## Risk

All changes are purely structural: no new runtime logic, no API surface
changes. Highest-risk item is Pass B's enum value fix (lowercase →
capitalized categories), a bug fix for the demo forms. The `as any` cast
removal in `sheet-product-form.tsx` is a positive type-safety improvement.

## Out of Scope

- Changes to vendored shadcn primitives beyond the named `infobar.tsx` and
  the documented `FilterTrigger` extraction.
- New features, behavior changes, or test additions.
