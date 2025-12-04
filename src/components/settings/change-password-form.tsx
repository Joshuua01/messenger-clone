import { authClient } from '@/lib/auth-client';
import { changePasswordSchema } from '@/lib/validation-schema';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { FormField } from '../form-field';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

export function ChangePasswordForm() {
  const navigation = useNavigate();
  const changePasswordForm = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validators: {
      onSubmit: changePasswordSchema,
    },
    onSubmit: async (values) => {
      const { oldPassword, newPassword } = values.value;
      await authClient.changePassword(
        {
          currentPassword: oldPassword,
          newPassword: newPassword,
          revokeOtherSessions: true,
        },
        {
          onSuccess: () => {
            toast.success('Password changed successfully!');
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
    <div>
      <h1 className="text-lg font-bold">Password</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          changePasswordForm.handleSubmit();
        }}
        className="mt-4 flex flex-col gap-1"
      >
        <changePasswordForm.Field name="oldPassword">
          {(field) => (
            <FormField
              field={field}
              label="Current password"
              type="password"
              placeholder="Enter current password..."
              autoComplete="none"
              labelFont="font-semibold"
            />
          )}
        </changePasswordForm.Field>

        <changePasswordForm.Field name="newPassword">
          {(field) => (
            <FormField
              field={field}
              label="New password"
              type="password"
              placeholder="Enter the new password..."
              autoComplete="none"
              labelFont="font-semibold"
            />
          )}
        </changePasswordForm.Field>

        <changePasswordForm.Field name="confirmNewPassword">
          {(field) => (
            <FormField
              field={field}
              label="Confirm new password"
              type="password"
              placeholder="Enter the new password again..."
              autoComplete="none"
              labelFont="font-semibold"
            />
          )}
        </changePasswordForm.Field>

        <changePasswordForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} className="mt-2 self-end font-bold">
              {isSubmitting ? (
                <>
                  <Spinner /> Changing password...
                </>
              ) : (
                'Change password'
              )}
            </Button>
          )}
        </changePasswordForm.Subscribe>
      </form>
    </div>
  );
}
