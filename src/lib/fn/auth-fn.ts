import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { getSession } from '../auth-client';

export const getSessionFn = createServerFn().handler(async () => {
  const headers = await getRequestHeaders();
  const session = await getSession({
    fetchOptions: {
      headers: headers,
    },
  });

  return { session };
});
