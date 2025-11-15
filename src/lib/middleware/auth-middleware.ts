import { createMiddleware } from '@tanstack/react-start';
import { getSessionFn } from '../fn/auth-fn';

export const withAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const { session } = await getSessionFn();

    if (!session?.data?.user) {
      throw new Response('Unauthorized', { status: 401 });
    }

    return next({
      context: {
        user: session.data.user,
      },
    });
  },
);
