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
