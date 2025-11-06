import { db } from '@/server/db';
import { conversation, privateConversation, user } from '@/server/db/schema';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, or } from 'drizzle-orm';
import z from 'zod';

const conversationFnSchema = z.object({
  participantIds: z.array(z.string()).length(2),
});

export const createPrivateConversationFn = createServerFn()
  .inputValidator(conversationFnSchema)
  .handler(async ({ data }) => {
    const { participantIds } = data;
    const [userA, userB] = participantIds.sort();

    const existingPrivate = await db.query.privateConversation.findFirst({
      where: (p) =>
        or(
          and(eq(p.userAId, userA), eq(p.userBId, userB)),
          and(eq(p.userAId, userB), eq(p.userBId, userA)),
        ),
    });

    if (existingPrivate) {
      return existingPrivate.conversationId;
    }

    const [newConversation] = await db
      .insert(conversation)
      .values({ type: 'private' })
      .returning({ id: conversation.id });

    await db.insert(privateConversation).values({
      conversationId: newConversation.id,
      userAId: userA,
      userBId: userB,
    });

    return newConversation.id;
  });

export const getUserConversationsFn = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    const userId = data;

    const conversations = await db
      .select({
        conversationId: conversation.id,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt,
        otherUserName: user.name,
        otherUserImage: user.image,
      })
      .from(conversation)
      .innerJoin(
        privateConversation,
        eq(conversation.id, privateConversation.conversationId),
      )
      .innerJoin(
        user,
        or(
          and(
            eq(privateConversation.userAId, user.id),
            eq(privateConversation.userBId, userId),
          ),
          and(
            eq(privateConversation.userBId, user.id),
            eq(privateConversation.userAId, userId),
          ),
        ),
      )
      .where(
        or(
          eq(privateConversation.userAId, userId),
          eq(privateConversation.userBId, userId),
        ),
      )
      .orderBy(desc(conversation.updatedAt));

    return conversations;
  });
