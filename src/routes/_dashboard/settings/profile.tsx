import { FormField } from '@/components/form-field';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { authClient, useSession } from '@/lib/auth-client';
import {
  changeEmailSchema,
  changeNameSchema,
  ChangePasswordForm,
  changePasswordSchema,
} from '@/lib/validation-schema';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/_dashboard/settings/profile')({
  component: RouteComponent,
});

const changePasswordValues: ChangePasswordForm = {
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

function RouteComponent() {
  const session = useSession();
  const navigation = useNavigate();
  const changePasswordForm = useForm({
    defaultValues: changePasswordValues,
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

  const handleUserDeletion = async () => {
    await authClient.deleteUser({});
    toast.success('Account deleted successfully!');
    navigation({ to: '/' });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and account details.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full overflow-auto pr-2">
          <h1 className="text-xl font-bold">Reset password</h1>
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
          <h1 className="text-xl font-bold">Change your name</h1>
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
          <h1 className="text-xl font-bold">Change your email</h1>
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
          <div className="flex items-center justify-between mt-6">
            <h1 className="text-xl font-bold">Delete account</h1>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUserDeletion}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <br />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
