# Spaghetti-Code Cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce maintainability debt by removing duplication, splitting over-large modules, and deleting dead code — no behavior or UI changes.

**Architecture:** 4 independent passes (A–D), each producing a small commit-safe change set. Passes A and B touch auth/product routes; C touches a shared component; D is a catch-all cleanup. Each pass is independently reviewable.

**Tech Stack:** React 19, TanStack Router/Form/Query, Zod, Bun, Vitest, Playwright.

## Global Constraints

- Existing tests must stay green after every task.
- E2E tests must pass after Pass A and Pass B (routes/form changes).
- `bun run lint` and `bun run typecheck` must pass after every pass.
- No behavior or UI changes — refactoring only.
- All category values must use the canonical `'Electronics'` / `'Furniture'` / `'Clothing'` / `'Toys'` / `'Groceries'` / `'Books'` / `'Jewelry'` / `'Beauty Products'` strings from `features/products/constants/product-options.ts`.

---

## File Structure

After this plan:

```
src/
├── features/auth/components/
│   ├── auth-shell.tsx              # NEW — shared v1 split-screen shell
│   ├── auth-card.tsx               # NEW — shared v2 auth card
│   ├── sign-in-view.tsx            # MOD — uses AuthShell
│   ├── sign-up-view.tsx            # MOD — uses AuthShell
│   ├── user-auth-form.tsx          # MOD — use PasswordInput (less boilerplate)
│   ├── register-form.tsx           # MOD — use PasswordInput (less boilerplate)
│   └── ... (unchanged)
├── features/forms/components/
│   ├── multi-step-product-form.tsx # MOD — import canonical schema + options
│   ├── sheet-product-form.tsx      # MOD — import canonical schema + options, remove as any
│   └── sheet-form-demo.tsx         # MOD — import canonical options
├── features/products/
│   ├── constants/product-options.ts # UNCHANGED (canonical source)
│   └── schemas/product.ts          # UNCHANGED (canonical source)
├── components/
│   ├── github-stars-button.tsx     # MOD — suspense boundary + lib/github.ts
│   ├── icons.tsx                   # MOD — add GitHubIcon
│   ├── layout/app-sidebar.tsx      # MOD — delete dead useEffect
│   ├── forms/demo-form.tsx         # MOD — extract inline fields
│   └── ui/
│       ├── infobar.tsx             # SPLIT — 4 files
│       ├── data-table-faceted-filter.tsx  # MOD — use shared FilterTrigger
│       ├── data-table-date-filter.tsx      # MOD — use shared FilterTrigger
│       ├── data-table-slider-filter.tsx    # MOD — use shared FilterTrigger
│       ├── filter-trigger.tsx              # NEW — shared clear-filter button
│       └── ... (unchanged)
├── hooks/
│   └── use-data-table.ts           # MOD — extract pure helpers
├── lib/
│   ├── github.ts                   # NEW — fetchGitHubRepo + formatCount
│   └── db/products.ts              # MOD — add getProductOr404 helper
```

---

---

### Task 1: AuthShell component (Pass A)

**Files:**

- Create: `src/features/auth/components/auth-shell.tsx`
- Modify: `src/features/auth/components/sign-in-view.tsx`
- Modify: `src/features/auth/components/sign-up-view.tsx`

**Interfaces:**

- Consumes: props `title: string`, `subtitle: string`, `footerLinkText: string`, `footerLinkTo: string`, `children: React.ReactNode`
- Produces: `<AuthShell>` component used by sign-in/sign-up views

- [ ] **Step 1: Create `src/features/auth/components/auth-shell.tsx`**

```tsx
import { IconCommand } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

interface AuthShellProps {
  title: string;
  subtitle: string;
  footerLinkText: string;
  footerLinkTo: string;
  children: React.ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  footerLinkText,
  footerLinkTo,
  children
}: AuthShellProps) {
  return (
    <div className='flex h-dvh'>
      <div className='hidden bg-primary lg:block lg:w-1/3'>
        <div className='flex h-full flex-col items-center justify-center p-12 text-center'>
          <div className='space-y-6'>
            <IconCommand className='mx-auto size-12 text-primary-foreground' />
            <div className='space-y-2'>
              <h1 className='font-light text-5xl text-primary-foreground'>{title}</h1>
              <p className='text-primary-foreground/80 text-xl'>{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='flex w-full items-center justify-center bg-background p-8 lg:w-2/3'>
        <div className='w-full max-w-md space-y-10 py-24 lg:py-32'>{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/features/auth/components/sign-in-view.tsx`**

Replace the entire layout with:

```tsx
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import AuthShell from './auth-shell';
import UserAuthForm from './user-auth-form';

export default function SignInViewPage() {
  return (
    <AuthShell
      title='Hello again'
      subtitle='Login to continue'
      footerLinkText="Don't have an account?"
      footerLinkTo='/auth/sign-up'
      linkLabel='Register'
    >
      <div className='space-y-4'>
        <div className='space-y-4 text-center'>
          <div className='font-medium tracking-tight'>Login</div>
          <div className='mx-auto max-w-xl text-muted-foreground'>
            Welcome back. Enter your email and password, let&apos;s hope you remember them this
            time.
          </div>
        </div>
        <div className='space-y-4'>
          <UserAuthForm />
          <Button variant='outline' className='w-full' type='button' disabled>
            Login with Google
          </Button>
          <p className='text-center text-muted-foreground text-xs'>
            <Link to='/auth/sign-up' className='text-primary'>
              Register
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
```

- [ ] **Step 3: Update `src/features/auth/components/sign-up-view.tsx`**

```tsx
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import AuthShell from './auth-shell';
import RegisterForm from './register-form';

export default function SignUpViewPage() {
  return (
    <AuthShell
      title='New here?'
      subtitle='Create an account'
      footerLinkText='Already have an account?'
      footerLinkTo='/auth/sign-in'
      linkLabel='Sign in'
    >
      <div className='space-y-4'>
        <div className='space-y-4 text-center'>
          <div className='font-medium tracking-tight'>Create an account</div>
          <div className='mx-auto max-w-xl text-muted-foreground'>
            Enter your details below and let&apos;s get you started on your journey.
          </div>
        </div>
        <div className='space-y-4'>
          <RegisterForm />
          <Button variant='outline' className='w-full' type='button' disabled>
            Sign up with Google
          </Button>
          <p className='text-center text-muted-foreground text-xs'>
            <Link to='/auth/sign-in' className='text-primary'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
```

Note: `AuthShell` renders the split-screen container only; each view passes its own form + heading as `children`.

- [ ] **Step 4: Run unit tests and lint**

Run: `bun run test && bun run lint`

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/auth-shell.tsx src/features/auth/components/sign-in-view.tsx src/features/auth/components/sign-up-view.tsx
git commit -m "refactor(auth): extract shared AuthShell for v1 sign-in/sign-up"
```

---

### Task 2: AuthCard component (Pass A)

**Files:**

- Create: `src/features/auth/components/auth-card.tsx`
- Modify: `src/routes/auth/v2/sign-in/index.tsx`
- Modify: `src/routes/auth/v2/sign-up/index.tsx`

**Interfaces:**

- Consumes: props `title: string`, `subtitle: string`, `linkLabel: string`, `linkTo: string`, `linkText: string`, `children: React.ReactNode`
- Produces: `<AuthCard>` component used by v2 sign-in/sign-up routes

- [ ] **Step 1: Create `src/features/auth/components/auth-card.tsx`**

```tsx
import { IconCommand, IconWorld } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

interface AuthCardProps {
  title: string;
  subtitle: string;
  linkLabel: string;
  linkTo: string;
  linkText: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  linkLabel,
  linkTo,
  linkText,
  children
}: AuthCardProps) {
  return (
    <>
      <div className='mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]'>
        <div className='space-y-2 text-center'>
          <h1 className='font-medium text-3xl'>{title}</h1>
          <p className='text-muted-foreground text-sm'>{subtitle}</p>
        </div>
        <div className='space-y-4'>{children}</div>
      </div>

      <div className='absolute top-5 flex w-full justify-end px-10'>
        <div className='text-muted-foreground text-sm'>
          {linkLabel}{' '}
          <Link className='text-foreground' to={linkTo}>
            {linkText}
          </Link>
        </div>
      </div>

      <div className='absolute bottom-5 flex w-full justify-between px-10'>
        <div className='text-sm'>© {new Date().getFullYear()}, TanStack Dashboard.</div>
        <div className='flex items-center gap-1 text-sm'>
          <IconWorld className='size-4 text-muted-foreground' />
          ENG
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Update `src/routes/auth/v2/sign-in/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import AuthCard from '@/features/auth/components/auth-card';
import UserAuthForm from '@/features/auth/components/user-auth-form';

export const Route = createFileRoute('/auth/v2/sign-in/')({
  head: () => ({
    meta: [{ title: 'Sign In - V2' }]
  }),
  component: SignInV2Page
});

function SignInV2Page() {
  return (
    <AuthCard
      title='Login to your account'
      subtitle='Please enter your details to login.'
      linkLabel="Don't have an account?"
      linkTo='/auth/v2/sign-up'
      linkText='Register'
    >
      <Button variant='secondary' className='w-full' type='button' disabled>
        Continue with Google
      </Button>
      <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t'>
        <span className='relative z-10 bg-background px-2 text-muted-foreground'>
          Or continue with
        </span>
      </div>
      <UserAuthForm />
    </AuthCard>
  );
}
```

- [ ] **Step 3: Update `src/routes/auth/v2/sign-up/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import AuthCard from '@/features/auth/components/auth-card';
import RegisterForm from '@/features/auth/components/register-form';

export const Route = createFileRoute('/auth/v2/sign-up/')({
  head: () => ({
    meta: [{ title: 'Sign Up - V2' }]
  }),
  component: SignUpV2Page
});

function SignUpV2Page() {
  return (
    <AuthCard
      title='Create an account'
      subtitle='Enter your details to get started.'
      linkLabel='Already have an account?'
      linkTo='/auth/v2/sign-in'
      linkText='Sign in'
    >
      <Button variant='secondary' className='w-full' type='button' disabled>
        Continue with Google
      </Button>
      <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t'>
        <span className='relative z-10 bg-background px-2 text-muted-foreground'>
          Or continue with
        </span>
      </div>
      <RegisterForm />
    </AuthCard>
  );
}
```

- [ ] **Step 4: Run unit tests and Playwright E2E**

Run: `bun run test && bun run test:e2e`

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/auth-card.tsx src/routes/auth/v2/sign-in/index.tsx src/routes/auth/v2/sign-up/index.tsx
git commit -m "refactor(auth): extract shared AuthCard for v2 sign-in/sign-up"
```

---

### Task 3: Product schema + category dedup (Pass B)

**Files:**

- Modify: `src/features/forms/components/multi-step-product-form.tsx`
- Modify: `src/features/forms/components/sheet-product-form.tsx`
- Modify: `src/features/forms/components/sheet-form-demo.tsx`
- Read-only (no changes): `src/features/products/schemas/product.ts`, `src/features/products/constants/product-options.ts`

**Interfaces:**

- Consumes: `productSchema` (z.ZodObject) from `features/products/schemas/product.ts`; `categoryOptions` from `features/products/constants/product-options.ts`
- Produces: No new exports — just updated imports in consumer files

- [ ] **Step 1: Update `src/features/forms/components/multi-step-product-form.tsx`**

Current imports (lines 1–13):

```tsx
import * as React from 'react';
import { useAppForm, withFieldGroup } from '@/components/ui/tanstack-form';
import { revalidateLogic, useStore } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Icons } from '@/components/icons';
import { FieldDescription } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { useFormStepper } from '@/hooks/use-stepper';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
```

Current inline schema (lines 16–30):

```tsx
const productFormSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters')
});

const stepSchemas = [
  // Step 1: Basic Info
  productFormSchema.pick({ name: true, category: true, price: true }),
  // Step 2: Details
  productFormSchema.pick({ description: true }),
  // Step 3: Review (no validation)
  z.object({})
];
```

Current inline category options (lines 34–39):

```tsx
const categoryOptions = [
  { value: 'beauty', label: 'Beauty Products' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Outdoors' }
];
```

Replace imports + remove inline schema + remove inline categories:

```tsx
import * as React from 'react';
import { useAppForm, withFieldGroup } from '@/components/ui/tanstack-form';
import { revalidateLogic, useStore } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Icons } from '@/components/icons';
import { FieldDescription } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { useFormStepper } from '@/hooks/use-stepper';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { productSchema } from '@/features/products/schemas/product';
import { categoryOptions } from '@/features/products/constants/product-options';
```

```tsx
const stepSchemas = [
  productSchema.pick({ name: true, category: true, price: true }),
  productSchema.pick({ description: true }),
  z.object({})
];
```

- [ ] **Step 2: Update `src/features/forms/components/sheet-product-form.tsx`**

Current imports (lines 1–23) and inline schema (lines 25–30):

```tsx
import { useAppForm } from '@/components/ui/tanstack-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useState } from 'react';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters')
});
```

Replace with:

```tsx
import { useAppForm } from '@/components/ui/tanstack-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { productSchema } from '@/features/products/schemas/product';
import { categoryOptions } from '@/features/products/constants/product-options';
```

Then remove lines 25–30 (the inline `const productSchema = ...`).

Then find and remove the `as any` cast on line 44:

```tsx
// BEFORE (line 44):
onSubmit: productSchema as any;

// AFTER:
onSubmit: productSchema;
```

- [ ] **Step 3: Update `src/features/forms/components/sheet-form-demo.tsx`**

Read current imports + inline category options. Replace inline category list with import:

```tsx
import { categoryOptions } from '@/features/products/constants/product-options';
```

Remove the inline `categoryOptions` array and use the imported one.

- [ ] **Step 4: Run unit tests and Playwright E2E**

Run: `bun run test && bun run test:e2e`

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/forms/components/multi-step-product-form.tsx src/features/forms/components/sheet-product-form.tsx src/features/forms/components/sheet-form-demo.tsx
git commit -m "refactor(forms): import canonical productSchema + categoryOptions, remove inline copies and as any cast"
```

---

### Task 4: GitHub stars button cleanup (Pass C)

**Files:**

- Create: `src/lib/github.ts`
- Modify: `src/components/github-stars-button.tsx`
- Modify: `src/components/icons.tsx`

**Interfaces:**

- Consumes: `fetchGitHubRepo(owner, repo)` and `formatCount(count)` from `lib/github.ts`
- Produces: `GitHubIcon` added to `icons.tsx`

- [ ] **Step 1: Create `src/lib/github.ts`**

```ts
export interface GitHubRepo {
  fullName: string;
  stars: number;
}

export async function fetchGitHubRepo(owner: string, repo: string): Promise<GitHubRepo | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: 'application/vnd.github.v3+json' }
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as Record<string, unknown>).full_name === 'string' &&
      typeof (data as Record<string, unknown>).stargazers_count === 'number'
    ) {
      return {
        fullName: (data as { full_name: string }).full_name,
        stars: (data as { stargazers_count: number }).stargazers_count
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}m`;
  }
  if (count >= 1_000) {
    const value = count / 1_000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}k`;
  }
  return count.toLocaleString('en-US');
}
```

- [ ] **Step 2: Add `GitHubIcon` to `src/components/icons.tsx`**

Find the Icons export block and add `GitHubIcon` inside it (the SVG is currently inline in `github-stars-button.tsx` lines 47–69):

```tsx
function GitHubIcon({
  iconStyle = 'currentColor',
  className
}: {
  iconStyle?: 'currentColor' | 'github' | 'copilot' | 'muted';
  className?: string;
}) {
  const fill =
    iconStyle === 'currentColor' ? 'currentColor' : iconStyle === 'github' ? '#fff' : '#8b5cf6';
  return (
    <svg
      viewBox='0 0 16 16'
      fill='none'
      className={cn('size-4', className)}
      style={iconStyle === 'muted' ? { color: 'var(--muted-foreground)' } : { color: fill }}
      aria-hidden='true'
    >
      <path
        d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z'
        fill={fill}
      />
    </svg>
  );
}
```

Also export it from the `Icons` object at the bottom of `icons.tsx`.

- [ ] **Step 3: Update `src/components/github-stars-button.tsx`**

Replace the top imports (lines 1–4) with:

```tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { fetchGitHubRepo, formatCount } from '@/lib/github';
import { Icons } from '@/components/icons';
```

Remove the old self-contained `fetchGitHubRepo` (lines 12–29) and `formatCount` (lines 31–41) and `GitHubIcon` (lines 47–69).

Change `async function GitHubStarsButton` (currently line 112) to a regular function and wrap its body in `<Suspense>` by exporting a wrapper component. The simplest approach: make the button itself a client component that accepts `stars` as a prop, and keep the fetch inside the route file with Suspense. However, to keep changes minimal: keep the async component but add an explicit Suspense boundary at the call site.

Update the component to remove `async` from the function signature, add `'use client'`, and use `useState`/`useEffect` for the fetch with a loading fallback inside the component:

```tsx
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { fetchGitHubRepo, formatCount } from '@/lib/github';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';

const githubStarsButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

type GitHubStarsButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof githubStarsButtonVariants> & {
    owner: string;
    repo: string;
  };

function GitHubStarsButton({
  owner,
  repo,
  variant,
  size,
  className,
  ...props
}: GitHubStarsButtonProps) {
  const [stars, setStars] = React.useState<number | null>(null);
  const [fullName, setFullName] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetchGitHubRepo(owner, repo).then((data) => {
      if (cancelled) return;
      if (data) {
        setStars(data.stars);
        setFullName(data.fullName);
      } else {
        setError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  if (error || stars === null) {
    return (
      <button
        className={cn(githubStarsButtonVariants({ variant, size }), className)}
        disabled
        {...props}
      >
        <Icons.github className='mr-2 size-4' />
        {error ? 'Error' : '...'}
      </button>
    );
  }

  return (
    <button className={cn(githubStarsButtonVariants({ variant, size }), className)} {...props}>
      <Icons.github className='mr-2 size-4' />
      {fullName ?? `${owner}/${repo}`} · ★ {formatCount(stars)}
    </button>
  );
}

export { GitHubStarsButton, githubStarsButtonVariants, type GitHubStarsButtonProps };
```

- [ ] **Step 4: Run unit tests and lint**

Run: `bun run test && bun run lint`

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/github.ts src/components/github-stars-button.tsx src/components/icons.tsx
git commit -m "refactor(github): move fetch/formatCount to lib/github.ts, add GitHubIcon to icons.tsx, convert button to client component with local state"
```

---

### Task 5: Dead useEffect + filter trigger (Pass D — quick wins)

**Files:**

- Modify: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/ui/filter-trigger.tsx`
- Modify: `src/components/ui/data-table-faceted-filter.tsx`
- Modify: `src/components/ui/data-table-date-filter.tsx`
- Modify: `src/components/ui/data-table-slider-filter.tsx`

**Interfaces:**

- Produces: `<FilterTrigger>` shared component

- [ ] **Step 1: Delete dead useEffect in `app-sidebar.tsx`**

In `src/components/layout/app-sidebar.tsx`, remove lines 40–42:

```tsx
React.useEffect(() => {
  // Side effects based on sidebar state changes
}, [isOpen]);
```

Also verify `isOpen` (line 36) is used elsewhere in the file. If it's only set but never read after removing the effect, remove the `useMediaQuery` import and line 36.

- [ ] **Step 2: Create `src/components/ui/filter-trigger.tsx`**

```tsx
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface FilterTriggerProps {
  title: string;
  value: string;
  onClear: () => void;
  children: React.ReactNode;
}

export default function FilterTrigger({ title, value, onClear, children }: FilterTriggerProps) {
  return (
    <Button
      aria-label={`Clear ${title} filter`}
      variant='ghost'
      className='h-8 w-8 p-0 hover:bg-transparent'
      onClick={onClear}
    >
      <Icons.xCircle className='h-4 w-4' />
    </Button>
  );
}
```

- [ ] **Step 3: Replace clear-filter buttons in the 3 table filter components**

In each of `data-table-faceted-filter.tsx`, `data-table-date-filter.tsx`, `data-table-slider-filter.tsx`, find the duplicated `<button aria-label="Clear {title} filter">` block and replace with:

```tsx
<FilterTrigger title={title} value={value} onClear={onClear} />
```

(Adjust the exact prop names to match each component's existing API — `title`, `value`, and `onClear` should be available or derivable from existing props.)

- [ ] **Step 4: Run unit tests and lint**

Run: `bun run test && bun run lint`

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/app-sidebar.tsx src/components/ui/filter-trigger.tsx src/components/ui/data-table-faceted-filter.tsx src/components/ui/data-table-date-filter.tsx src/components/ui/data-table-slider-filter.tsx
git commit -m "refactor: delete dead useEffect in sidebar, extract shared FilterTrigger"
```

---

### Task 6: Auth field boilerplate reduction (Pass D)

**Files:**

- Create: `src/components/forms/fields/password-field.tsx`
- Modify: `src/features/auth/components/register-form.tsx`
- Modify: `src/features/auth/components/user-auth-form.tsx`

**Interfaces:**

- Consumes: TanStack Form `field` API passed as a prop (`{ name, state, handleChange, handleBlur }`)
- Produces: `<PasswordField>` component that collapses the eye-toggle + `Input` + `FieldError` scaffold

**Context (verified current code):** Both auth forms repeat this exact scaffold for passwords
(`user-auth-form.tsx:76-113`, `register-form.tsx` password/confirm blocks):

```tsx
<field.FieldSet>
  <field.Field>
    <field.FieldLabel htmlFor={field.name}>Password</field.FieldLabel>
    <div className='relative'>
      <Input id={field.name} name={field.name} type={show ? 'text' : 'password'}
        value={field.state.value} onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)} autoComplete='current-password'
        disabled={loading} aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
        className='pr-10' />
      <button type='button' onClick={() => setShow(!show)} ...>eye toggle</button>
    </div>
  </field.Field>
  <field.FieldError />
</field.FieldSet>
```

- [ ] **Step 1: Create `src/components/forms/fields/password-field.tsx`**

```tsx
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import type { ReactFormExtension, FieldApi } from '@tanstack/react-form';

interface PasswordFieldProps {
  field: FieldApi<ReactFormExtension<unknown>, unknown, string, unknown, unknown, unknown, unknown>;
  show: boolean;
  onToggle: () => void;
  label: string;
  loading?: boolean;
  autoComplete?: string;
}

export function PasswordField({
  field,
  show,
  onToggle,
  label,
  loading,
  autoComplete
}: PasswordFieldProps) {
  return (
    <field.FieldSet>
      <field.Field>
        <field.FieldLabel htmlFor={field.name}>{label}</field.FieldLabel>
        <div className='relative'>
          <Input
            id={field.name}
            name={field.name}
            type={show ? 'text' : 'password'}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder='••••••••'
            autoComplete={autoComplete}
            disabled={loading}
            aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
            className='pr-10'
          />
          <button
            type='button'
            onClick={onToggle}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            tabIndex={-1}
          >
            {show ? <Icons.eyeOff className='h-4 w-4' /> : <Icons.eye className='h-4 w-4' />}
          </button>
        </div>
      </field.Field>
      <field.FieldError />
    </field.FieldSet>
  );
}
```

> Note: Confirm the exact `FieldApi` generic signature by hovering over `field` in an existing
> `form.AppField` render prop in the IDE; adjust the generic params if TypeScript complains.
> If the generic is cumbersome, type `field` as `any` locally — this is a refactor of existing
> working code, not new logic.

- [ ] **Step 2: Update `user-auth-form.tsx` password block**

Replace lines 76–113 (the `form.AppField name='password'` block) with:

```tsx
<form.AppField
  name='password'
  children={(field) => (
    <PasswordField
      field={field}
      show={showPassword}
      onToggle={() => setShowPassword(!showPassword)}
      label='Password'
      loading={loading}
      autoComplete='current-password'
    />
  )}
/>
```

- [ ] **Step 3: Update `register-form.tsx` password blocks**

`register-form.tsx` has password and confirmPassword blocks. Replace each `form.AppField` password
block body with `<PasswordField>` using the corresponding show-state
(`showPassword`/`setShowPassword`, `showConfirmPassword`/`setShowConfirmPassword`).

- [ ] **Step 4: Run unit tests and lint**

Run: `bun run test && bun run lint`

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/fields/password-field.tsx src/features/auth/components/register-form.tsx src/features/auth/components/user-auth-form.tsx
git commit -m "refactor(auth): extract PasswordField to collapse repeated auth password scaffold"
```

---

### Task 7: use-data-table refactor (Pass D)

**Files:**

- Modify: `src/hooks/use-data-table.ts`
- Modify: `src/lib/parsers.ts`

**Interfaces:**

- Consumes: existing `ARRAY_SEPARATOR` (from `parsers.ts` or a config), column definitions
- Produces: pure helpers `parseFilterValuesFromSearch` and `buildFilterSearchParams` in `parsers.ts`

**Context (verified current code):**

- `lib/parsers.ts` already exports `parseFiltersState` / `serializeFiltersState` (Zod-based, for the
  _advanced_ filter JSON encoding) and `parseSortingState` / `serializeSortingState`. These are
  DIFFERENT from the _search-param_ filter parsing done inside `use-data-table.ts` for the
  non-advanced (`enableAdvancedFilter === false`) path.
- `use-data-table.ts` duplicates the comma `ARRAY_SEPARATOR` split/join logic:
  - read: line 162 `val.split(ARRAY_SEPARATOR)`
  - write: line 182 `value.join(ARRAY_SEPARATOR)`
    This should live in `parsers.ts` alongside the other filter helpers.

- [ ] **Step 1: Confirm `ARRAY_SEPARATOR` location**

Grep `use-data-table.ts` for `ARRAY_SEPARATOR` to find its source import.

- [ ] **Step 2: Add two pure helpers to `src/lib/parsers.ts`**

```ts
const ARRAY_SEPARATOR = ',';

export function parseFilterValuesFromSearch(
  search: Record<string, unknown>,
  columns: { id?: string; meta?: { options?: unknown } }[]
): Record<string, string | string[] | null> {
  const values: Record<string, string | string[] | null> = {};
  for (const column of columns) {
    const key = column.id ?? '';
    const val = search[key];
    if (val !== undefined && val !== null) {
      if (column.meta?.options) {
        values[key] = typeof val === 'string' ? val.split(ARRAY_SEPARATOR) : null;
      } else {
        values[key] = typeof val === 'string' ? val : null;
      }
    } else {
      values[key] = null;
    }
  }
  return values;
}

export function buildFilterSearchParams(
  values: Record<string, string | string[] | null>
): (prev: Record<string, unknown>) => Record<string, unknown> {
  return (prev) => {
    const next: Record<string, unknown> = { ...prev, page: 1 };
    for (const [key, value] of Object.entries(values)) {
      if (value === null || value === undefined) {
        delete next[key];
      } else if (Array.isArray(value)) {
        next[key] = value.join(ARRAY_SEPARATOR);
      } else {
        next[key] = value;
      }
    }
    return next;
  };
}
```

- [ ] **Step 3: Update `use-data-table.ts` to use the new helpers**

Replace the inline `filterValues` useMemo (lines 153–171) with:

```ts
const filterValues = React.useMemo(
  () => (enableAdvancedFilter ? {} : parseFilterValuesFromSearch(search, filterableColumns)),
  [search, filterableColumns, enableAdvancedFilter]
);
```

Replace the body of `debouncedSetFilterValues` (lines 173–193) `navigate` `search:` callback to use
`buildFilterSearchParams(values)`:

```ts
const debouncedSetFilterValues = useDebouncedCallback(
  (values: Record<string, string | string[] | null>) => {
    void navigate({ search: buildFilterSearchParams(values), replace: history === 'replace' });
  },
  debounceMs
);
```

Remove the now-unused local `ARRAY_SEPARATOR` definition if it was declared inside `use-data-table.ts`.

- [ ] **Step 4: Run unit tests and lint**

Run: `bun run test && bun run lint`

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-data-table.ts src/lib/parsers.ts
git commit -m "refactor: extract search-param filter parse/build helpers from use-data-table into lib/parsers"
```

---

### Task 8: infobar.tsx split (Pass D)

**Files:**

- Create: `src/components/ui/infobar-context.tsx`
- Modify: `src/components/ui/infobar.tsx` (shell only)
- Create: `src/components/ui/infobar-sheet.tsx`
- Create: `src/components/ui/infobar-menu.tsx`

**Interfaces:**

- Produces: 4 focused files; `infobar.tsx` re-exports everything for backward compatibility

- [ ] **Step 1: Create `src/components/ui/infobar-context.tsx`**

Move `InfobarContext`, `InfobarProvider`, `useInfobar`, and all related types/state into this file.

- [ ] **Step 2: Create `src/components/ui/infobar-sheet.tsx`**

Move the mobile `Sheet` + `SheetContent` block (the `InfobarSheet` component and related `SheetTrigger`) into this file.

- [ ] **Step 3: Create `src/components/ui/infobar-menu.tsx`**

Move the `InfobarMenu`, `InfobarGroup`, `InfobarMenuItem` sub-components into this file.

- [ ] **Step 4: Update `src/components/ui/infobar.tsx`**

Keep only the main `Infobar` shell component that assembles the sidebar shell. Import from the new sub-files.

At the bottom, add a re-export block so existing imports from `infobar.tsx` still work. The full
current export list (infobar.tsx:730–755) is:

```
Infobar, InfobarContent, InfobarFooter, InfobarGroup, InfobarGroupAction,
InfobarGroupContent, InfobarGroupLabel, InfobarHeader, InfobarInput, InfobarInset,
InfobarMenu, InfobarMenuAction, InfobarMenuBadge, InfobarMenuButton, InfobarMenuItem,
InfobarMenuSkeleton, InfobarMenuSub, InfobarMenuSubButton, InfobarMenuSubItem,
InfobarProvider, InfobarRail, InfobarSeparator, InfobarTrigger, useInfobar
```

Re-export all of these from the split modules. For example (adjust paths to match where each symbol
actually lands):

```tsx
export {
  Infobar,
  InfobarContent,
  InfobarFooter,
  InfobarHeader,
  InfobarInput,
  InfobarInset,
  InfobarRail,
  InfobarSeparator,
  InfobarTrigger
} from './infobar-shell';
export {
  InfobarProvider,
  useInfobar,
  type HelpfulLink,
  type DescriptiveSection,
  type InfobarContent as InfobarContentType
} from './infobar-context';
export { InfobarSheet } from './infobar-sheet';
export {
  InfobarMenu,
  InfobarMenuAction,
  InfobarMenuBadge,
  InfobarMenuButton,
  InfobarMenuItem,
  InfobarMenuSkeleton,
  InfobarMenuSub,
  InfobarMenuSubButton,
  InfobarMenuSubItem
} from './infobar-menu';
export {
  InfobarGroup,
  InfobarGroupAction,
  InfobarGroupContent,
  InfobarGroupLabel
} from './infobar-group';
```

> Keep the exact public export names identical so no importer breaks. After splitting, run
> `bun run typecheck` to confirm every downstream import still resolves.

- [ ] **Step 5: Run unit tests and lint**

Run: `bun run test && bun run lint`

Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/infobar.tsx src/components/ui/infobar-context.tsx src/components/ui/infobar-sheet.tsx src/components/ui/infobar-menu.tsx
git commit -m "refactor(ui): split infobar.tsx into context, shell, sheet, and menu modules"
```

---

### Task 9: demo-form.tsx inline fields extraction (Pass D)

**Files:**

- Modify: `src/components/forms/demo-form.tsx`
- Create: `src/components/forms/fields/combobox-field.tsx`
- Create: `src/components/forms/fields/tags-field.tsx`
- Create: `src/components/forms/fields/section-title.tsx`

**Interfaces:**

- Produces: reusable field components extracted from inline demo-form definitions

- [ ] **Step 1: Read inline field components in `demo-form.tsx`**

Identify `ComboboxField` (approx lines 97–158), `TagsField`, and `SectionTitle` inline definitions.

- [ ] **Step 2: Extract each to its own file in `components/forms/fields/`**

Move the component definitions to `combobox-field.tsx`, `tags-field.tsx`, and `section-title.tsx`. Export them from `components/forms/fields/index.ts` if one exists, or create one.

- [ ] **Step 3: Update imports in `demo-form.tsx`**

Replace inline definitions with imports from `./fields`.

- [ ] **Step 4: Run unit tests and lint**

Run: `bun run test && bun run lint`

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/demo-form.tsx src/components/forms/fields/combobox-field.tsx src/components/forms/fields/tags-field.tsx src/components/forms/fields/section-title.tsx
git commit -m "refactor: extract inline demo-form fields into reusable components/forms/fields/"
```

---

### Task 10: db/products.ts helper (Pass D)

**Files:**

- Modify: `src/lib/db/products.ts`

**Interfaces:**

- Consumes: existing `ProductByIdResponse`, `serialize`, `mapDbError`, `eq`, `products`, `db`
- Produces: `getProductOr404(id)` helper

- [ ] **Step 1: Add `getProductOr404` helper to `src/lib/db/products.ts`**

```ts
async function getProductOr404(id: number) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) {
    return null;
  }
  return product;
}
```

- [ ] **Step 2: Replace the triplicated preamble in `updateProduct` and `deleteProduct`**

In `updateProduct` (line 182) replace:

```ts
const [existing] = await db.select().from(products).where(eq(products.id, id));
if (!existing) {
  return { success: false, message: `Product with ID ${id} not found` };
}
const [updated] = await db
  .update(products)
  .set({ ... })
  .where(eq(products.id, id))
  .returning();
```

With:

```ts
const existing = await getProductOr404(id);
if (!existing) {
  return { success: false, message: `Product with ID ${id} not found` };
}
const [updated] = await db
  .update(products)
  .set({ ... })
  .where(eq(products.id, id))
  .returning();
```

Same treatment for `deleteProduct` (line 211).

- [ ] **Step 3: Run unit tests and lint**

Run: `bun run test && bun run lint`

Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/products.ts
git commit -m "refactor(db): add getProductOr404 helper, deduplicate load-row preamble in update/delete"
```

---

## Implementation Notes (actual vs plan)

- **Task 4 (GitHub button):** The plan draft proposed converting the async Server Component to a
  `'use client'` button with local state + Suspense. The implemented version kept the component as
  an async Server Component and only relocated `fetchGitHubRepo`/`formatCount` (to `lib/github.ts`)
  and `GitHubIcon`/`IconStyle` (to `components/icons.tsx`). This matches the spec's stated goal
  ("move fetch + formatCount + icon + cva into separate files") and is a faithful refactor. A
  client/Suspense conversion remains a possible follow-up if render-time fetch becomes a concern.
- **Task 8 (infobar split):** The plan's illustrative re-export used `./infobar-shell` and an
  `InfobarSheet` export. The actual implementation kept the shell inside `infobar.tsx` itself and
  placed the trigger in `infobar-sheet.tsx` exported as `InfobarTrigger`. The actual public API
  (all 24 values + 3 types) matches the binding spec exactly — the naming difference is cosmetic.
- **Task 6 (PasswordField):** uses `field: any` (pragmatic for a refactor of existing working code);
  could be tightened to a real `FieldApi` type later if desired.
- **Task 3 (product schema dedup):** delivered the latent-bug fix — demo `categoryOptions` now use
  the canonical uppercase enum values (`Electronics`, etc.) matching `product-options.ts` and the DB
  enum, removing the prior lowercase literals (`electronics`, `beauty`).
- All tasks: `bun run typecheck`/`lint` pass. Unit tests green except one pre-existing unrelated
  DB seed-count failure in `src/lib/db/products.test.ts` that also fails on the clean tree.
