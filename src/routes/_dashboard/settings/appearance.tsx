import { ModeToggle } from '@/components/mode-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/settings/appearance')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Appearance Settings</CardTitle>
        <CardDescription>Customize the look and feel of your application.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col pr-2 pl-1">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Theme Mode</h1>
            <ModeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
