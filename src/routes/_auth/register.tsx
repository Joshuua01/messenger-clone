import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { RegisterForm, registerSchema } from '@/lib/validation-schema';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
});

const defaultValues: RegisterForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function RouteComponent() {
  const navigation = useNavigate();
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async (values) => {
      const { email, password, name } = values.value;
      await authClient.signUp.email(
        {
          email: email,
          password: password,
          name: name,
        },
        {
          onSuccess: () => {
            toast.success('User registered successfully!');
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

        <form.Field name="name">
          {(field) => (
            <FormField
              field={field}
              label="Name"
              type="text"
              autoComplete="given-name"
              placeholder="Enter your name..."
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

        <form.Field name="confirmPassword">
          {(field) => (
            <FormField
              field={field}
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password..."
              autoComplete="new-password"
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} size={'lg'} className="mt-2 font-bold">
              {isSubmitting ? (
                <>
                  <Spinner /> Creating...{' '}
                </>
              ) : (
                'Create an account'
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <div className="text-sm">
        Already have an account?{' '}
        <Link to="/login" className="hover font-bold underline underline-offset-2">
          Log in here
        </Link>
      </div>
    </div>
  );
}
