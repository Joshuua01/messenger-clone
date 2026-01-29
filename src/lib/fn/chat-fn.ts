import { db } from '@/server/db';
import { chat, chatParticipant, message, messageAttachment, user } from '@/server/db/schema';
import { createServerFn } from '@tanstack/react-start';
import { and, count, desc, eq, gt, inArray, isNotNull, lt, ne } from 'drizzle-orm';
import z from 'zod';
import { withAuth } from '../middleware/auth-middleware';
import { MessageWithSender } from '../types';

const chatFnSchema = z.object({
  participantIds: z.array(z.string()).min(2),
});

export const createChatFn = createServerFn()
  .inputValidator(chatFnSchema)
  .middleware([withAuth])
  .handler(async ({ data }) => {
    const { participantIds } = data;
    const uniqueParticipants = [...new Set(participantIds)].sort();
    const isPrivate = uniqueParticipants.length <= 2;

    if (isPrivate) {
      const [userA, userB] = uniqueParticipants;

      const existingChat = await db
        .select({ chatId: chatParticipant.chatId })
        .from(chatParticipant)
        .innerJoin(chat, and(eq(chat.id, chatParticipant.chatId), eq(chat.type, 'private')))
        .where(eq(chatParticipant.userId, userA))
        .intersect(
          db
            .select({ chatId: chatParticipant.chatId })
            .from(chatParticipant)
            .where(eq(chatParticipant.userId, userB)),
        )
        .limit(1);

      if (existingChat.length > 0) {
        return existingChat[0].chatId;
      }
    }

    return await db.transaction(async (tx) => {
      const [newChat] = await tx
        .insert(chat)
        .values({
          type: isPrivate ? 'private' : 'group',
        })
        .returning({ id: chat.id });

      await tx.insert(chatParticipant).values(
        uniqueParticipants.map((userId) => ({
          chatId: newChat.id,
          userId,
          lastReadAt: new Date(),
        })),
      );

      return newChat.id;
    });
  });

export const getCurrentUserChatsFn = createServerFn()
  .middleware([withAuth])
  .inputValidator(
    z.object({
      cursor: z.string().optional(),
      limit: z.number().default(15),
    }),
  )
  .handler(async ({ context, data }) => {
    const { id: currentUserId } = context.user;
    const { cursor, limit } = data;

    const chats = await db
      .select({
        id: chat.id,
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt,
        type: chat.type,
        lastReadAt: chatParticipant.lastReadAt,
      })
      .from(chat)
      .innerJoin(chatParticipant, eq(chat.id, chatParticipant.chatId))
      .where(
        cursor
          ? and(
              eq(chatParticipant.userId, currentUserId),
              isNotNull(chat.lastMessage),
              lt(
                chat.updatedAt,
                db
                  .select({ updatedAt: chat.updatedAt })
                  .from(chat)
                  .where(eq(chat.id, cursor))
                  .limit(1),
              ),
            )
          : and(eq(chatParticipant.userId, currentUserId), isNotNull(chat.lastMessage)),
      )
      .orderBy(desc(chat.updatedAt))
      .limit(limit + 1);

    const hasMore = chats.length > limit;
    const chatsSlice = hasMore ? chats.slice(0, limit) : chats;

    const chatIds = chatsSlice.map((c) => c.id);

    const unreadCounts =
      chatIds.length > 0
        ? await db
            .select({
              chatId: message.chatId,
              count: count(),
            })
            .from(message)
            .innerJoin(
              chatParticipant,
              and(
                eq(chatParticipant.chatId, message.chatId),
                eq(chatParticipant.userId, currentUserId),
              ),
            )
            .where(
              and(
                inArray(message.chatId, chatIds),
                ne(message.senderId, currentUserId),
                gt(message.createdAt, chatParticipant.lastReadAt),
              ),
            )
            .groupBy(message.chatId)
        : [];

    const unreadByChat = Object.fromEntries(unreadCounts.map((u) => [u.chatId, u.count]));

    const otherParticipants =
      chatIds.length > 0
        ? await db
            .select({
              chatId: chatParticipant.chatId,
              userId: user.id,
              userName: user.name,
              userImage: user.image,
            })
            .from(chatParticipant)
            .innerJoin(user, eq(user.id, chatParticipant.userId))
            .where(
              and(
                ne(chatParticipant.userId, currentUserId),
                inArray(chatParticipant.chatId, chatIds),
              ),
            )
        : [];

    const participantsByChat = otherParticipants.reduce<Record<string, typeof otherParticipants>>(
      (acc, p) => {
        (acc[p.chatId] ??= []).push(p);
        return acc;
      },
      {},
    );

    const result = chatsSlice.map((chat) => ({
      ...chat,
      participants: participantsByChat[chat.id] ?? [],
      unreadCount: unreadByChat[chat.id] ?? 0,
    }));

    return {
      chats: result,
      nextCursor: hasMore ? chatsSlice[chatsSlice.length - 1].id : undefined,
    };
  });

export const getParticipantsInfoFn = createServerFn()
  .inputValidator(z.string())
  .middleware([withAuth])
  .handler(async ({ data, context }) => {
    const chatId = data;
    const { id: currentUserId } = context.user;

    const participantsInfo = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(chatParticipant)
      .innerJoin(user, eq(chatParticipant.userId, user.id))
      .where(and(eq(chatParticipant.chatId, chatId), ne(chatParticipant.userId, currentUserId)));

    return participantsInfo;
  });

export const getMessagesForChatFn = createServerFn()
  .inputValidator(
    z.object({
      chatId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().default(10),
    }),
  )
  .middleware([withAuth])
  .handler(async ({ data }): Promise<{ messages: MessageWithSender[]; nextCursor?: string }> => {
    const { chatId, cursor, limit } = data;

    const messages = await db
      .select({
        messageId: message.id,
        chatId: message.chatId,
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
              eq(message.chatId, chatId),
              lt(
                message.createdAt,
                db
                  .select({ createdAt: message.createdAt })
                  .from(message)
                  .where(eq(message.id, cursor))
                  .limit(1),
              ),
            )
          : eq(message.chatId, chatId),
      )
      .orderBy(desc(message.createdAt))
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;
    paginatedMessages.reverse();

    const messageIds = paginatedMessages.map((msg) => msg.messageId);
    const attachments =
      messageIds.length > 0
        ? await db
            .select({
              id: messageAttachment.id,
              messageId: messageAttachment.messageId,
              url: messageAttachment.url,
              name: messageAttachment.name,
              type: messageAttachment.type,
            })
            .from(messageAttachment)
            .where(inArray(messageAttachment.messageId, messageIds))
        : [];

    const attachmentsByMessageId: Record<string, typeof attachments> = {};
    attachments.forEach((attachment) => {
      if (!attachmentsByMessageId[attachment.messageId]) {
        attachmentsByMessageId[attachment.messageId] = [];
      }
      attachmentsByMessageId[attachment.messageId].push(attachment);
    });

    const messagesWithAttachments = paginatedMessages.map((msg) => ({
      ...msg,
      attachments: attachmentsByMessageId[msg.messageId] || [],
    }));

    return {
      messages: messagesWithAttachments,
      nextCursor: hasMore ? paginatedMessages[0].messageId : undefined,
    };
  });

export const sendMessageFn = createServerFn()
  .middleware([withAuth])
  .inputValidator(
    z.object({
      chatId: z.string(),
      senderId: z.string(),
      content: z.string().nullable(),
      attachments: z
        .array(
          z.object({
            url: z.string(),
            name: z.string(),
            type: z.string(),
          }),
        )
        .optional(),
    }),
  )
  .handler(async ({ data }): Promise<MessageWithSender> => {
    return await db.transaction(async (tx) => {
      const [newMessage] = await tx
        .insert(message)
        .values({
          chatId: data.chatId,
          senderId: data.senderId,
          content: data.content,
        })
        .returning();

      const messageAttachments =
        data.attachments && data.attachments.length > 0
          ? await tx
              .insert(messageAttachment)
              .values(
                data.attachments.map((attachment) => ({
                  messageId: newMessage.id,
                  url: attachment.url,
                  name: attachment.name,
                  type: attachment.type,
                })),
              )
              .returning()
          : [];

      const lastMessage = data.content ? data.content : 'Attachment';

      await tx.update(chat).set({ lastMessage }).where(eq(chat.id, data.chatId));

      const [messageWithUser] = await tx
        .select({
          messageId: message.id,
          chatId: message.chatId,
          content: message.content,
          createdAt: message.createdAt,
          senderId: user.id,
          senderName: user.name,
          senderImage: user.image,
        })
        .from(message)
        .innerJoin(user, eq(message.senderId, user.id))
        .where(eq(message.id, newMessage.id));

      return {
        ...messageWithUser,
        attachments: messageAttachments,
      };
    });
  });

export const markChatReadFn = createServerFn()
  .inputValidator(
    z.object({
      chatId: z.string(),
    }),
  )
  .middleware([withAuth])
  .handler(async ({ data, context }) => {
    const { chatId } = data;
    const { id: userId } = context.user;

    await db
      .update(chatParticipant)
      .set({ lastReadAt: new Date() })
      .where(and(eq(chatParticipant.chatId, chatId), eq(chatParticipant.userId, userId)));
  });
