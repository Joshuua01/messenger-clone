import { ChangeEmailForm } from '@/components/settings/change-email-form';
import { ChangeNameForm } from '@/components/settings/change-name-form';
import { ChangePasswordForm } from '@/components/settings/change-password-form';
import { ChangeProfilePictureForm } from '@/components/settings/change-profile-picture-form';
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
import { authClient } from '@/lib/auth-client';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/_dashboard/settings/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigation = useNavigate();

  const handleUserDeletion = async () => {
    await authClient.deleteUser(
      {},
      {
        onSuccess: () => {
          toast.success('Account deleted successfully!');
          navigation({ to: '/' });
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
        <CardDescription>
          Update your personal information and account details.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full overflow-auto pr-2 pl-1">
          <ChangeProfilePictureForm />

          <ChangePasswordForm />

          <ChangeNameForm />

          <ChangeEmailForm />

          <div className="flex flex-col items-center mt-6">
            <h1 className="text-lg font-bold self-start">Delete account</h1>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="self-end">
                  Delete account
                </Button>
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
