import AuthShell from './auth-shell';
import RegisterForm from './register-form';

export default function SignUpViewPage() {
  return (
    <AuthShell
      title='New here?'
      subtitle='Create an account'
      form={<RegisterForm />}
      googleButtonLabel='Continue with Google'
      footerPrefix='Already have an account?'
      footerLinkTo='/auth/sign-in'
      footerLinkLabel='Sign in'
    >
      <div className='space-y-4 text-center'>
        <div className='font-medium tracking-tight'>Create an account</div>
        <div className='mx-auto max-w-xl text-muted-foreground'>
          Enter your details below and let&apos;s get you started on your journey.
        </div>
      </div>
    </AuthShell>
  );
}
