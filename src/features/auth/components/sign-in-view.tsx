import AuthShell from './auth-shell';
import UserAuthForm from './user-auth-form';

export default function SignInViewPage() {
  return (
    <AuthShell
      title='Hello again'
      subtitle='Login to continue'
      form={<UserAuthForm />}
      googleButtonLabel='Continue with Google'
      footerPrefix="Don't have an account?"
      footerLinkTo='/auth/sign-up'
      footerLinkLabel='Register'
    >
      <div className='space-y-4 text-center'>
        <div className='font-medium tracking-tight'>Login</div>
        <div className='mx-auto max-w-xl text-muted-foreground'>
          Welcome back. Enter your email and password, let&apos;s hope you remember them this time.
        </div>
      </div>
    </AuthShell>
  );
}
