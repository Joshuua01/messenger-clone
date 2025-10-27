import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/settings/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and account details.
        </CardDescription>
        <CardContent>Profile settings content goes here.</CardContent>
      </CardHeader>
    </Card>
  );
}
