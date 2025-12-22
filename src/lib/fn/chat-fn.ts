import { db } from '@/server/db';
import { chat, message, messageAttachment, privateChat, user } from '@/server/db/schema';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, inArray, isNotNull, lt, or } from 'drizzle-orm';
import z from 'zod';
import { withAuth } from '../middleware/auth-middleware';
import { MessageWithSender } from '../types';

const chatFnSchema = z.object({
  participantIds: z.array(z.string()).length(2),
});

export const createPrivateChatFn = createServerFn()
  .inputValidator(chatFnSchema)
  .middleware([withAuth])
  .handler(async ({ data }) => {
    const { participantIds } = data;
    const [userA, userB] = participantIds.sort();

    const existingPrivate = await db.query.privateChat.findFirst({
      where: (p) =>
        or(
          and(eq(p.userAId, userA), eq(p.userBId, userB)),
          and(eq(p.userAId, userB), eq(p.userBId, userA)),
        ),
    });

    if (existingPrivate) {
      return existingPrivate.chatId;
    }

    const [newChat] = await db.insert(chat).values({ type: 'private' }).returning({ id: chat.id });

    await db.insert(privateChat).values({
      chatId: newChat.id,
      userAId: userA,
      userBId: userB,
    });

    return newChat.id;
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
    const { id: userId } = context.user;
    const { cursor, limit } = data;

    const chats = await db
      .select({
        id: chat.id,
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt,
        otherUserId: user.id,
        otherUserName: user.name,
        otherUserImage: user.image,
      })
      .from(chat)
      .innerJoin(privateChat, eq(chat.id, privateChat.chatId))
      .innerJoin(
        user,
        or(
          and(eq(privateChat.userAId, user.id), eq(privateChat.userBId, userId)),
          and(eq(privateChat.userBId, user.id), eq(privateChat.userAId, userId)),
        ),
      )
      .where(
        cursor
          ? and(
              or(eq(privateChat.userAId, userId), eq(privateChat.userBId, userId)),
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
          : and(
              or(eq(privateChat.userAId, userId), eq(privateChat.userBId, userId)),
              isNotNull(chat.lastMessage),
            ),
      )
      .orderBy(desc(chat.updatedAt))
      .limit(limit + 1);

    const hasMore = chats.length > limit;
    const chatsSlice = hasMore ? chats.slice(0, limit) : chats;

    return {
      chats: chatsSlice,
      nextCursor: hasMore ? chatsSlice[chatsSlice.length - 1].id : undefined,
    };
  });

export const getOtherUserInfoFn = createServerFn()
  .inputValidator(z.string())
  .middleware([withAuth])
  .handler(async ({ data, context }) => {
    const chatId = data;
    const { id: currentUserId } = context.user;

    const otherUserInfo = await db
      .select({
        otherUserId: user.id,
        otherUserName: user.name,
        otherUserImage: user.image,
      })
      .from(chat)
      .innerJoin(privateChat, eq(chat.id, privateChat.chatId))
      .innerJoin(
        user,
        or(
          and(eq(privateChat.userAId, user.id), eq(privateChat.userBId, currentUserId)),
          and(eq(privateChat.userBId, user.id), eq(privateChat.userAId, currentUserId)),
        ),
      )
      .where(eq(chat.id, chatId))
      .limit(1);

    return otherUserInfo[0];
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

export const getChatParticipantsFn = createServerFn()
  .inputValidator(z.string())
  .middleware([withAuth])
  .handler(async ({ data }) => {
    const chatId = data;

    const [chat] = await db.select().from(privateChat).where(eq(privateChat.chatId, chatId));

    if (chat) {
      const participants = [chat.userAId, chat.userBId];
      return participants;
    }

    return [];
  });
