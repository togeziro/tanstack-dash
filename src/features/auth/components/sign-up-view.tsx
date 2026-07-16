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
