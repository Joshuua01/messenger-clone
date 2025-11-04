import { db } from '@/server/db';
import { user } from '@/server/db/schema';
import { createServerFn } from '@tanstack/react-start';
import { ilike } from 'drizzle-orm';
import z from 'zod';

export const searchUserFn = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: query }) => {
    const users = await db
      .select()
      .from(user)
      .where(ilike(user.name, `%${query}%`))
      .limit(10);

    return users;
  });
