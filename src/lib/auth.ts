import { db } from '@/server/db';
import { APIError, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { reactStartCookies } from 'better-auth/react-start';
import * as schema from '@/server/db/schema';
import { deleteImageFn } from './fn/upload-fn';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [reactStartCookies()],
  baseURL: 'http://localhost:3000',
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async ({ image }) => {
        if (image) {
          const result = await deleteImageFn({
            data: { imageUrl: image },
          });
          if (!result.success) {
            throw new APIError('INTERNAL_SERVER_ERROR', {
              message: "Failed to delete user's image before deleting account.",
            });
          }
        }
      },
    },
  },
});
