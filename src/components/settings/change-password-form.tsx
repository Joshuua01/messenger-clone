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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        changePasswordForm.handleSubmit();
      }}
      className="flex flex-col gap-1 mt-4"
    >
      <changePasswordForm.Field name="oldPassword">
        {(field) => (
          <FormField
            field={field}
            label="Old Password"
            type="password"
            placeholder="Enter current password..."
            autoComplete="none"
          />
        )}
      </changePasswordForm.Field>

      <changePasswordForm.Field name="newPassword">
        {(field) => (
          <FormField
            field={field}
            label="New Password"
            type="password"
            placeholder="Enter the new password..."
          />
        )}
      </changePasswordForm.Field>

      <changePasswordForm.Field name="confirmNewPassword">
        {(field) => (
          <FormField
            field={field}
            label="Confirm New Password"
            type="password"
            placeholder="Enter the new password again..."
            autoComplete="none"
          />
        )}
      </changePasswordForm.Field>

      <changePasswordForm.Subscribe
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
                <Spinner /> Changing password...
              </>
            ) : (
              'Change password'
            )}
          </Button>
        )}
      </changePasswordForm.Subscribe>
    </form>
  );
}
