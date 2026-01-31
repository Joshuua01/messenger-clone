import { ChatHeader } from '@/components/chat/chat-header';
import { MessageInput } from '@/components/chat/message-input';
import { MessageList } from '@/components/chat/message-list';
import { ScrollToBottomButton } from '@/components/chat/scroll-to-bottom-button';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { usePaginatedMessages } from '@/hooks/use-paginated-messages';
import { usePresence } from '@/hooks/use-presence';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { useSendMessage } from '@/hooks/use-send-message';
import { getSessionFn } from '@/lib/fn/auth-fn';
import {
  getChatInfoFn,
  getMessagesForChatFn,
  getParticipantsInfoFn,
  markChatReadFn,
} from '@/lib/fn/chat-fn';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import React, { useEffect, useLayoutEffect, useMemo } from 'react';

export const Route = createFileRoute('/_dashboard/chat/$chatId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { chatId } = params;
    const [chatData, chatInfo, currentSession, participantsInfo] = await Promise.all([
      getMessagesForChatFn({ data: { chatId } }),
      getChatInfoFn({ data: chatId }),
      getSessionFn(),
      getParticipantsInfoFn({ data: chatId }),
    ]);

    return {
      chatMessages: chatData.messages,
      initialCursor: chatData.nextCursor,
      chatInfo,
      currentUserId: currentSession.session.data?.user.id,
      participantsInfo,
    };
  },
});

function RouteComponent() {
  const router = useRouter();
  const { chatId } = Route.useParams();
  const { chatMessages, initialCursor, currentUserId, chatInfo, participantsInfo } =
    Route.useLoaderData();

  const { scrollRef, isAtBottom, scrollToBottom, checkScrollPosition } = useScrollToBottom();

  const { addMessage, hasMore, isLoading, loadMore, messages } = usePaginatedMessages({
    initialMessages: chatMessages,
    initialCursor,
    chatId,
  });

  const { isTyping, emitTyping } = useChatSocket(chatId, currentUserId!, (message) => {
    addMessage(message);
    scrollToBottom('smooth');
  });

  const participantsIds = useMemo(() => participantsInfo.map((p) => p.id), [participantsInfo]);

  const presence = usePresence(participantsIds);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [chatId, scrollToBottom]);

  useEffect(() => {
    if (isTyping && isAtBottom) scrollToBottom('smooth');
  }, [isTyping, isAtBottom, scrollToBottom]);

  const { sendAttachments, sendMessage } = useSendMessage({
    chatId,
    currentUserId: currentUserId,
    participantsIds,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    if (target.scrollTop < 50 && hasMore && !isLoading) {
      loadMore();
    }

    checkScrollPosition(target);
  };

  useEffect(() => {
    const markAsRead = async () => {
      if (document.visibilityState === 'visible') {
        await markChatReadFn({ data: { chatId } });
        router.invalidate();
      }
    };

    markAsRead();

    document.addEventListener('visibilitychange', markAsRead);

    return () => {
      document.removeEventListener('visibilitychange', markAsRead);
    };
  }, [chatId]);

  return (
    <div className="h-full flex-1 overflow-hidden">
      <div className="bg-card text-card-foreground flex h-full flex-col overflow-hidden rounded-xl border shadow-sm">
        <ChatHeader
          isOnline={participantsIds.some((id) => presence[id])}
          participants={participantsInfo}
          chatInfo={chatInfo}
        />
        <ScrollArea className="min-h-0 flex-1 px-6 py-1" onScroll={handleScroll} key={chatId}>
          <div className="flex flex-col gap-1">
            <MessageList messages={messages} isLoading={isLoading} currentUserId={currentUserId} />
            {isTyping && <TypingIndicator />}
            <div ref={scrollRef} />
            <ScrollToBottomButton isAtBottom={isAtBottom} scrollRef={scrollRef} />
          </div>
        </ScrollArea>
        <MessageInput
          onSend={sendMessage}
          onSendAttachments={sendAttachments}
          onTyping={emitTyping}
        />
      </div>
    </div>
  );
}
