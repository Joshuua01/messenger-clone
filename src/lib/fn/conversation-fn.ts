import { db } from '@/server/db';
import { conversation, message, privateConversation, user } from '@/server/db/schema';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, isNotNull, lt, or } from 'drizzle-orm';
import z from 'zod';
import { withAuth } from '../middleware/auth-middleware';
import { MessageWithSender } from '../types';

const conversationFnSchema = z.object({
  participantIds: z.array(z.string()).length(2),
});

export const createPrivateConversationFn = createServerFn()
  .inputValidator(conversationFnSchema)
  .middleware([withAuth])
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

export const getCurrentUserConversationsFn = createServerFn()
  .middleware([withAuth])
  .inputValidator(
    z.object({
      cursor: z.string().optional(),
      limit: z.number().default(15),
    }),
  )
  .handler(async ({ context, data }) => {
    const { id: userId } = context.user;
    const { cursor, limit } = data;

    const chats = await db
      .select({
        conversationId: conversation.id,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt,
        otherUserId: user.id,
        otherUserName: user.name,
        otherUserImage: user.image,
      })
      .from(conversation)
      .innerJoin(privateConversation, eq(conversation.id, privateConversation.conversationId))
      .innerJoin(
        user,
        or(
          and(eq(privateConversation.userAId, user.id), eq(privateConversation.userBId, userId)),
          and(eq(privateConversation.userBId, user.id), eq(privateConversation.userAId, userId)),
        ),
      )
      .where(
        cursor
          ? and(
              or(eq(privateConversation.userAId, userId), eq(privateConversation.userBId, userId)),
              isNotNull(conversation.lastMessage),
              lt(
                conversation.updatedAt,
                db
                  .select({ updatedAt: conversation.updatedAt })
                  .from(conversation)
                  .where(eq(conversation.id, cursor))
                  .limit(1),
              ),
            )
          : and(
              or(eq(privateConversation.userAId, userId), eq(privateConversation.userBId, userId)),
              isNotNull(conversation.lastMessage),
            ),
      )
      .orderBy(desc(conversation.updatedAt))
      .limit(limit + 1);

    const hasMore = chats.length > limit;
    const conversations = hasMore ? chats.slice(0, limit) : chats;

    return {
      conversations,
      nextCursor: hasMore ? conversations[conversations.length - 1].conversationId : undefined,
    };
  });

export const getOtherUserInfoFn = createServerFn()
  .inputValidator(z.string())
  .middleware([withAuth])
  .handler(async ({ data, context }) => {
    const conversationId = data;
    const { id: currentUserId } = context.user;

    const conversationInfo = await db
      .select({
        otherUserId: user.id,
        otherUserName: user.name,
        otherUserImage: user.image,
      })
      .from(conversation)
      .innerJoin(privateConversation, eq(conversation.id, privateConversation.conversationId))
      .innerJoin(
        user,
        or(
          and(
            eq(privateConversation.userAId, user.id),
            eq(privateConversation.userBId, currentUserId),
          ),
          and(
            eq(privateConversation.userBId, user.id),
            eq(privateConversation.userAId, currentUserId),
          ),
        ),
      )
      .where(eq(conversation.id, conversationId))
      .limit(1);

    return conversationInfo[0];
  });

export const getMessagesForConversationFn = createServerFn()
  .inputValidator(
    z.object({
      conversationId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().default(10),
    }),
  )
  .middleware([withAuth])
  .handler(async ({ data }): Promise<{ messages: MessageWithSender[]; nextCursor?: string }> => {
    const { conversationId, cursor, limit } = data;

    const messages = await db
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
      .where(
        cursor
          ? and(
              eq(message.conversationId, conversationId),
              lt(
                message.createdAt,
                db
                  .select({ createdAt: message.createdAt })
                  .from(message)
                  .where(eq(message.id, cursor))
                  .limit(1),
              ),
            )
          : eq(message.conversationId, conversationId),
      )
      .orderBy(desc(message.createdAt))
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;
    paginatedMessages.reverse();

    return {
      messages: paginatedMessages,
      nextCursor: hasMore ? paginatedMessages[0].messageId : undefined,
    };
  });

export const sendMessageFn = createServerFn()
  .middleware([withAuth])
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

export const getConversationParticipants = createServerFn()
  .inputValidator(z.string())
  .middleware([withAuth])
  .handler(async ({ data }) => {
    const conversationId = data;

    const [conversation] = await db
      .select()
      .from(privateConversation)
      .where(eq(privateConversation.conversationId, conversationId));

    if (conversation) {
      const participants = [conversation.userAId, conversation.userBId];
      return participants;
    }

    return [];
  });
