import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
});

type RegisterForm = {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const defaultValues: RegisterForm = {
  name: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function RouteComponent() {
  const navigation = useNavigate();
  const form = useForm({
    defaultValues,
    onSubmit: async (values) => {
      const { email, password, name, surname } = values.value;
      await authClient.signUp.email(
        {
          email: email,
          password: password,
          name: name + ' ' + surname,
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-15">
      <h1 className="font-bold text-6xl">MessClone</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-3 w-1/4"
      >
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              !value
                ? 'An email is required'
                : value.length < 5
                  ? 'Email must be at least 5 characters'
                  : undefined,
          }}
        >
          {(field) => (
            <>
              <Label htmlFor={field.name} className="font-bold text-md">
                Email
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="Enter your email..."
              />
              <div className="text-destructive text-sm min-h-5">
                {field.state.meta.errors.map((err) => (
                  <div key={err}>{err}</div>
                ))}
              </div>
            </>
          )}
        </form.Field>

        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              !value
                ? 'A name is required'
                : value.length < 2
                  ? 'Name must be at least 2 characters'
                  : undefined,
          }}
        >
          {(field) => (
            <>
              <Label htmlFor={field.name} className="font-bold text-md">
                Name
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="text"
                autoComplete="name"
                placeholder="Enter your name..."
              />
              <div className="text-destructive text-sm min-h-5">
                {field.state.meta.errors.map((err) => (
                  <div key={err}>{err}</div>
                ))}
              </div>
            </>
          )}
        </form.Field>

        <form.Field
          name="surname"
          validators={{
            onChange: ({ value }) =>
              !value
                ? 'A surname is required'
                : value.length < 2
                  ? 'Surname must be at least 2 characters'
                  : undefined,
          }}
        >
          {(field) => (
            <>
              <Label htmlFor={field.name} className="font-bold text-md">
                Surname
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="text"
                autoComplete="name"
                placeholder="Enter your surname..."
              />
              <div className="text-destructive text-sm min-h-5">
                {field.state.meta.errors.map((err) => (
                  <div key={err}>{err}</div>
                ))}
              </div>
            </>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              !value
                ? 'A password is required'
                : value.length < 6
                  ? 'Password must be at least 6 characters'
                  : undefined,
          }}
        >
          {(field) => (
            <>
              <Label htmlFor={field.name} className="font-bold text-md">
                Password
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="password"
                placeholder="Enter your password..."
                autoComplete="off"
              />
              <div className="text-destructive text-sm min-h-5">
                {field.state.meta.errors.map((err) => (
                  <div key={err}>{err}</div>
                ))}
              </div>
            </>
          )}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChange: ({ value }) =>
              !value
                ? 'Confirm your password'
                : value !== form.state.values.password
                  ? 'Passwords do not match'
                  : undefined,
          }}
        >
          {(field) => (
            <>
              <Label htmlFor={field.name} className="font-bold text-md">
                Confirm password
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="password"
                placeholder="Confirm your password..."
                autoComplete="off"
              />
              <div className="text-destructive text-sm min-h-5">
                {field.state.meta.errors.map((err) => (
                  <div key={err}>{err}</div>
                ))}
              </div>
            </>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} size={'lg'}>
              {isSubmitting ? <Spinner /> : 'Register'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
