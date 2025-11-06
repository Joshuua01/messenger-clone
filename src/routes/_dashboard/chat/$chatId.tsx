import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/chat/$chatId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { chatId } = Route.useParams();
  return <div>Hello {chatId}</div>;
}
