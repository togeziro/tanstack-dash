import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { fetchGitHubRepo, formatCount } from '@/lib/github';
import { GitHubIcon, type IconStyle } from '@/components/icons';

// ─── Component ───────────────────────────────────────────────────────────────

const githubStarsButtonVariants = cva(
  'inline-flex items-center shrink-0 whitespace-nowrap font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
  {
    variants: {
      variant: {
        default:
          'rounded-md border border-border bg-muted/50 text-muted-foreground shadow-xs hover:bg-accent hover:text-accent-foreground',
        primary: 'rounded-md bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        secondary:
          'rounded-md border border-transparent bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        outline:
          'rounded-md border border-border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        ghost:
          'rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        subtle:
          'rounded-full border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
      },
      size: {
        sm: 'h-7 gap-1.5 px-2.5 text-xs [&_svg]:size-3.5',
        default: 'h-8 gap-2 px-3 text-sm [&_svg]:size-4',
        lg: 'h-9 gap-2.5 px-4 text-sm [&_svg]:size-4'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface GitHubStarsButtonProps
  extends
    Omit<React.ComponentProps<'a'>, 'children'>,
    VariantProps<typeof githubStarsButtonVariants> {
  owner: string;
  repo: string;
  stars?: number;
  showRepo?: boolean;
  iconStyle?: IconStyle;
}

async function GitHubStarsButton({
  owner,
  repo,
  stars: starsProp,
  showRepo = false,
  iconStyle = 'currentColor',
  variant,
  size,
  className,
  ...props
}: GitHubStarsButtonProps) {
  const data = starsProp == null ? await fetchGitHubRepo(owner, repo) : null;
  const stars = starsProp ?? data?.stars ?? null;
  const fullName = data?.fullName ?? `${owner}/${repo}`;

  return (
    <a
      href={`https://github.com/${owner}/${repo}`}
      target='_blank'
      rel='noopener noreferrer'
      data-slot='github-stars-button'
      aria-label={`${fullName} on GitHub${stars !== null ? ` — ${stars.toLocaleString('en-US')} stars` : ''}`}
      className={cn(githubStarsButtonVariants({ variant, size, className }))}
      {...props}
    >
      <GitHubIcon iconStyle={iconStyle} className='shrink-0' />
      {showRepo && <span>{fullName}</span>}
      {stars !== null && (
        <>
          {showRepo && <span className='bg-border h-3.5 w-px shrink-0' aria-hidden='true' />}
          <span className='tabular-nums'>{formatCount(stars)}</span>
        </>
      )}
    </a>
  );
}

export { GitHubStarsButton, githubStarsButtonVariants, type GitHubStarsButtonProps };
