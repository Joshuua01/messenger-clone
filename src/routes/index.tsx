import { getSessionFn } from '@/lib/fn/auth-fn';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (!session.session.data) {
      throw redirect({ to: '/login' });
    }
    if (session.session.data) {
      throw redirect({ to: '/chat' });
    }
  },
});

function App() {
  return (
    <div>
      <h1>Welcome to MessClone!</h1>
    </div>
  );
}
