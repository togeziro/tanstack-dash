import { IconCommand } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import RegisterForm from './register-form';

export default function SignUpViewPage() {
  return (
    <div className='flex h-dvh'>
      <div className='hidden bg-primary lg:block lg:w-1/3'>
        <div className='flex h-full flex-col items-center justify-center p-12 text-center'>
          <div className='space-y-6'>
            <IconCommand className='mx-auto size-12 text-primary-foreground' />
            <div className='space-y-2'>
              <h1 className='font-light text-5xl text-primary-foreground'>New here?</h1>
              <p className='text-primary-foreground/80 text-xl'>Create an account</p>
            </div>
          </div>
        </div>
      </div>

      <div className='flex w-full items-center justify-center bg-background p-8 lg:w-2/3'>
        <div className='w-full max-w-md space-y-10 py-24 lg:py-32'>
          <div className='space-y-4 text-center'>
            <div className='font-medium tracking-tight'>Create an account</div>
            <div className='mx-auto max-w-xl text-muted-foreground'>
              Enter your details below and let&apos;s get you started on your journey.
            </div>
          </div>
          <div className='space-y-4'>
            <RegisterForm />
            <Button variant='outline' className='w-full' type='button' disabled>
              <IconCommand className='mr-2 size-4' />
              Continue with Google
            </Button>
            <p className='text-center text-muted-foreground text-xs'>
              Already have an account?{' '}
              <Link to='/auth/sign-in' className='text-primary'>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
