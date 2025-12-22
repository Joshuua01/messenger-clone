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
import { getMessagesForChatFn, getOtherUserInfoFn } from '@/lib/fn/chat-fn';
import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useLayoutEffect } from 'react';

export const Route = createFileRoute('/_dashboard/chat/$chatId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { chatId } = params;
    const [chatData, currentSession, otherUserInfo] = await Promise.all([
      getMessagesForChatFn({ data: { chatId } }),
      getSessionFn(),
      getOtherUserInfoFn({ data: chatId }),
    ]);

    return {
      chatMessages: chatData.messages,
      initialCursor: chatData.nextCursor,
      currentUserId: currentSession.session.data?.user.id,
      otherUserInfo,
    };
  },
});

function RouteComponent() {
  const { chatId } = Route.useParams();
  const { chatMessages, initialCursor, currentUserId, otherUserInfo } = Route.useLoaderData();

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

  const presence = usePresence([otherUserInfo.otherUserId]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [chatId, scrollToBottom]);

  useEffect(() => {
    if (isTyping && isAtBottom) scrollToBottom('smooth');
  }, [isTyping, isAtBottom, scrollToBottom]);

  const { sendAttachments, sendMessage } = useSendMessage({
    chatId,
    currentUserId: currentUserId,
    otherUserId: otherUserInfo.otherUserId,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    if (target.scrollTop < 50 && hasMore && !isLoading) {
      loadMore();
    }

    checkScrollPosition(target);
  };

  return (
    <div className="h-full flex-1 overflow-hidden">
      <div className="bg-card text-card-foreground flex h-full flex-col overflow-hidden rounded-xl border shadow-sm">
        <ChatHeader
          isOnline={presence[otherUserInfo.otherUserId]}
          userName={otherUserInfo.otherUserName}
          imageUrl={otherUserInfo.otherUserImage}
        />
        <ScrollArea className="min-h-0 flex-1 px-6 py-1" onScroll={handleScroll} key={chatId}>
          <div className="flex flex-col gap-3">
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
