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
  const navigation = useNavigate();
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async (values) => {
      const { email, password } = values.value;
      await authClient.signIn.email(
        {
          email: email,
          password: password,
        },
        {
          onSuccess: () => {
            toast.success('User logged in successfully!');
            navigation({ to: '/' });
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      );
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      <h1 className="font-bold text-4xl">
        <Link to="/">MessClone</Link>
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col w-1/4 gap-1"
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
              autoComplete="new-password"
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit}
              size={'lg'}
              className="mt-2 font-bold"
            >
              {isSubmitting ? (
                <>
                  <Spinner /> Logging in...{' '}
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
        <Link
          to="/register"
          className="underline font-bold underline-offset-2 hover"
        >
          Register here
        </Link>
      </div>
    </div>
  );
}
