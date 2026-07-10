import { IconCommand, IconWorld } from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import UserAuthForm from '@/features/auth/components/user-auth-form';

export const Route = createFileRoute('/auth/v2/sign-in/')({
  head: () => ({
    meta: [{ title: 'Sign In - V2' }]
  }),
  component: SignInV2Page
});

function SignInV2Page() {
  return (
    <>
      <div className='mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]'>
        <div className='space-y-2 text-center'>
          <h1 className='font-medium text-3xl'>Login to your account</h1>
          <p className='text-muted-foreground text-sm'>Please enter your details to login.</p>
        </div>
        <div className='space-y-4'>
          <Button variant='secondary' className='w-full' type='button' disabled>
            <IconCommand className='mr-2 size-4' />
            Continue with Google
          </Button>
          <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t'>
            <span className='relative z-10 bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
          <UserAuthForm />
        </div>
      </div>

      <div className='absolute top-5 flex w-full justify-end px-10'>
        <div className='text-muted-foreground text-sm'>
          Don&apos;t have an account?{' '}
          <Link className='text-foreground' to='/auth/v2/sign-up'>
            Register
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
