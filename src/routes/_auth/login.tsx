import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { LoginForm, loginSchema } from '@/lib/validation-schema';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
});

const defaultValues: LoginForm = {
  email: '',
  password: '',
};

function RouteComponent() {
  const navigate = useNavigate();

  const handleLogin = async (values: { value: LoginForm }) => {
    const { email, password } = values.value;
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          toast.success('User logged in successfully!');
          navigate({ to: '/' });
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: handleLogin,
  });

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold">
        <Link to="/">MessClone</Link>
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex w-1/4 flex-col gap-1"
      >
        <form.Field name="email">
          {(field) => (
            <FormField
              field={field}
              label="Email"
              type="email"
              placeholder="Enter your email..."
              autoComplete="email"
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <FormField
              field={field}
              label="Password"
              type="password"
              placeholder="Enter your password..."
              autoComplete="current-password"
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} size={'lg'} className="mt-2 font-bold">
              {isSubmitting ? (
                <>
                  <Spinner /> Logging in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <div className="text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="hover font-bold underline underline-offset-2">
          Register here
        </Link>
      </div>
    </div>
  );
}
