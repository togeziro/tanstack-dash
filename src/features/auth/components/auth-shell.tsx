import { IconCommand } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

interface AuthShellProps {
  title: string;
  subtitle: string;
  footerLinkText: string;
  footerLinkTo: string;
  linkLabel?: string;
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
