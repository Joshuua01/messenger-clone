import { db } from '@/server/db';
import {
  conversation,
  message,
  privateConversation,
  user,
} from '@/server/db/schema';
import { createServerFn } from '@tanstack/react-start';
import { and, asc, desc, eq, or } from 'drizzle-orm';
import z from 'zod';
import { MessageWithSender } from '../types';

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

export const getMessagesForConversationFn = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data }): Promise<MessageWithSender[]> => {
    const conversationId = data;

    const conversationWithMessages = await db
      .select({
        messageId: message.id,
        conversationId: message.conversationId,
        content: message.content,
        createdAt: message.createdAt,
        senderId: user.id,
        senderName: user.name,
        senderImage: user.image,
      })
      .from(message)
      .innerJoin(user, eq(message.senderId, user.id))
      .where(eq(message.conversationId, conversationId))
      .orderBy(asc(message.createdAt));

    return conversationWithMessages;
  });

export const sendMessageFn = createServerFn()
  .inputValidator(
    z.object({
      conversationId: z.string(),
      senderId: z.string(),
      content: z.string(),
    }),
  )
  .handler(async ({ data }): Promise<MessageWithSender> => {
    return await db.transaction(async (tx) => {
      const [newMesssage] = await tx
        .insert(message)
        .values({
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
        })
        .returning();

      await tx
        .update(conversation)
        .set({ lastMessage: data.content })
        .where(eq(conversation.id, data.conversationId));

      const [messageWithUser] = await tx
        .select({
          messageId: message.id,
          conversationId: message.conversationId,
          content: message.content,
          createdAt: message.createdAt,
          senderId: user.id,
          senderName: user.name,
          senderImage: user.image,
        })
        .from(message)
        .innerJoin(user, eq(message.senderId, user.id))
        .where(eq(message.id, newMesssage.id));

      return messageWithUser;
    });
  });
