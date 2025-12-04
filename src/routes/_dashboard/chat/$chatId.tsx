import { ChatHeader } from '@/components/chat/chat-header';
import { MessageInput } from '@/components/chat/message-input';
import { MessageList } from '@/components/chat/message-list';
import { ScrollToButtomButton } from '@/components/chat/scroll-to-bottom-button';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { usePaginatedMessages } from '@/hooks/use-paginated-messages';
import { usePresence } from '@/hooks/use-presence';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { useSendMessage } from '@/hooks/use-send-message';
import { getSessionFn } from '@/lib/fn/auth-fn';
import { getMessagesForConversationFn, getOtherUserInfoFn } from '@/lib/fn/conversation-fn';
import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useLayoutEffect } from 'react';

export const Route = createFileRoute('/_dashboard/chat/$chatId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { chatId } = params;
    const [chatData, currentSession, otherUserInfo] = await Promise.all([
      getMessagesForConversationFn({ data: { conversationId: chatId } }),
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
  const { chatId: conversationId } = Route.useParams();
  const { chatMessages, initialCursor, currentUserId, otherUserInfo } = Route.useLoaderData();

  const { scrollRef, isAtBottom, scrollToBottom, checkScrollPosition } = useScrollToBottom();

  const { addMessage, hasMore, isLoading, loadMore, messages } = usePaginatedMessages({
    initialMessages: chatMessages,
    initialCursor,
    conversationId,
  });

  const { isTyping, emitTyping } = useChatSocket(conversationId, currentUserId!, (message) => {
    addMessage(message);
    scrollToBottom('smooth');
  });

  const presence = usePresence([otherUserInfo.otherUserId]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    if (isTyping && isAtBottom) scrollToBottom('smooth');
  }, [isTyping, isAtBottom, scrollToBottom]);

  const sendMessage = useSendMessage({
    conversationId,
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
    <div className="flex-1 h-full overflow-hidden">
      <div className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm h-full overflow-hidden">
        <ChatHeader
          isOnline={presence[otherUserInfo.otherUserId]}
          userName={otherUserInfo.otherUserName}
          imageUrl={otherUserInfo.otherUserImage}
        />
        <ScrollArea
          className="flex-1 min-h-0 px-6 py-1"
          onScroll={handleScroll}
          key={conversationId}
        >
          <div className="flex flex-col gap-3">
            <MessageList messages={messages} isLoading={isLoading} currentUserId={currentUserId} />
            {isTyping && <TypingIndicator />}
            <div ref={scrollRef} />
            <ScrollToButtomButton isAtBottom={isAtBottom} scrollRef={scrollRef} />
          </div>
        </ScrollArea>
        <MessageInput onSend={sendMessage} onTyping={emitTyping} />
      </div>
    </div>
  );
}
