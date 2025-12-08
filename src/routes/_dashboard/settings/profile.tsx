import { AlertButton } from '@/components/alert-button';
import { ChangeEmailForm } from '@/components/settings/change-email-form';
import { ChangeNameForm } from '@/components/settings/change-name-form';
import { ChangePasswordForm } from '@/components/settings/change-password-form';
import { ChangeProfilePictureForm } from '@/components/settings/change-profile-picture-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/_dashboard/settings/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleUserDeletion = async () => {
    await authClient.deleteUser(
      {},
      {
        onSuccess: () => {
          toast.success('Account deleted successfully!');
          navigate({ to: '/' });
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
        <CardDescription>Update your personal information and account details.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full overflow-auto pr-2 pl-1">
          <ChangeProfilePictureForm />

          <ChangePasswordForm />

          <ChangeNameForm />

          <ChangeEmailForm />

          <div className="mt-6 flex flex-col items-center">
            <h1 className="self-start text-lg font-bold">Delete account</h1>

            <AlertButton
              onClick={handleUserDeletion}
              title="Are you sure you want to delete your account?"
              description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
            >
              <Button variant="destructive" className="self-end">
                Delete account
              </Button>
            </AlertButton>
          </div>
          <br />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
