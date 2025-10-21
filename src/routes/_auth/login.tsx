import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="min-h-screen bg-slate-900">Hello "/_auth/login"!</div>;
}
