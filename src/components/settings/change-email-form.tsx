import { authClient, useSession } from '@/lib/auth-client';
import { changeEmailSchema } from '@/lib/validation-schema';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { FormField } from '../form-field';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

export function ChangeEmailForm() {
  const session = useSession();
  const changeEmailForm = useForm({
    defaultValues: {
      email: session.data?.user.email || '',
    },
    validators: {
      onSubmit: changeEmailSchema,
    },
    onSubmit: async (values) => {
      const { email } = values.value;
      await authClient.changeEmail(
        {
          newEmail: email,
        },
        {
          onSuccess: () => {
            toast.success('Email updated successfully!');
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      );
    },
  });
  return (
    <div>
      <h1 className="text-lg font-bold">Email</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          changeEmailForm.handleSubmit();
        }}
        className="mt-4 flex flex-col gap-1"
      >
        <changeEmailForm.Field name="email">
          {(field) => (
            <FormField
              field={field}
              label="Email"
              type="email"
              placeholder="Enter your new email..."
              autoComplete="email"
              renderLabel={false}
            />
          )}
        </changeEmailForm.Field>

        <changeEmailForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} className="mt-2 self-end font-bold">
              {isSubmitting ? (
                <>
                  <Spinner /> Updating email...
                </>
              ) : (
                'Update email'
              )}
            </Button>
          )}
        </changeEmailForm.Subscribe>
      </form>
    </div>
  );
}
