import { ModeToggle } from '@/components/mode-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/settings/appearance')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Appearance Settings</CardTitle>
        <CardDescription>
          Customize the look and feel of your application.
        </CardDescription>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Change theme</span>
            <ModeToggle />
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
