import { authClient, useSession } from '@/lib/auth-client';
import { changeNameSchema } from '@/lib/validation-schema';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { FormField } from '../form-field';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

export function ChangeNameForm() {
  const session = useSession();
  const changeNameForm = useForm({
    defaultValues: {
      name: session.data?.user.name || '',
    },
    validators: {
      onSubmit: changeNameSchema,
    },
    onSubmit: async (values) => {
      const { name } = values.value;
      await authClient.updateUser(
        {
          name,
        },
        {
          onSuccess: () => {
            toast.success('Name updated successfully!');
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
        changeNameForm.handleSubmit();
      }}
      className="flex flex-col gap-1 mt-4"
    >
      <changeNameForm.Field name="name">
        {(field) => (
          <FormField
            field={field}
            label="Name"
            type="text"
            placeholder="Enter your new name..."
            autoComplete="name"
          />
        )}
      </changeNameForm.Field>

      <changeNameForm.Subscribe
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
                <Spinner /> Updating name...
              </>
            ) : (
              'Update name'
            )}
          </Button>
        )}
      </changeNameForm.Subscribe>
    </form>
  );
}
