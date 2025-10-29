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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        changeEmailForm.handleSubmit();
      }}
      className="flex flex-col gap-1 mt-4"
    >
      <changeEmailForm.Field name="email">
        {(field) => (
          <FormField
            field={field}
            label="Email"
            type="email"
            placeholder="Enter your new email..."
            autoComplete="email"
          />
        )}
      </changeEmailForm.Field>

      <changeEmailForm.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit}
            size={'lg'}
            className="mt-2 font-bold self-end"
          >
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
  );
}
