import { db } from '@/server/db';
import { user } from '@/server/db/schema';
import { createServerFn } from '@tanstack/react-start';
import { and, ilike, ne } from 'drizzle-orm';
import z from 'zod';
import { withAuth } from '../middleware/auth-middleware';

export const searchUserFn = createServerFn()
  .middleware([withAuth])
  .inputValidator(z.string())
  .handler(async ({ data: query, context }) => {
    const users = await db
      .select()
      .from(user)
      .where(and(ilike(user.name, `%${query}%`), ne(user.id, context.user.id)))
      .limit(10);

    return users;
  });
