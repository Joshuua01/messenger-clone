import { MessageBubble } from '@/components/chat/message-bubble';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { getSessionFn } from '@/lib/fn/auth-fn';
import {
  getMessagesForConversationFn,
  sendMessageFn,
  getOtherUserConversationInfoFn,
} from '@/lib/fn/conversation-fn';
import { socket } from '@/lib/socket';
import { MessageWithSender } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ArrowDown } from 'lucide-react';
import React from 'react';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_dashboard/chat/$chatId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { chatId } = params;
    const [chatData, currentSession, conversationInfo] = await Promise.all([
      getMessagesForConversationFn({ data: { conversationId: chatId } }),
      getSessionFn(),
      getOtherUserConversationInfoFn({ data: chatId }),
    ]);

    return {
      chatMessages: chatData.messages,
      nextCursor: chatData.nextCursor,
      currentUserId: currentSession.session.data?.user.id,
      conversationInfo,
    };
  },
});

function RouteComponent() {
  const { chatId: conversationId } = Route.useParams();
  const {
    chatMessages,
    nextCursor: initialCursor,
    currentUserId,
    conversationInfo,
  } = Route.useLoaderData();

  const [messages, setMessages] = useState(chatMessages);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialCursor);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  };

  useLayoutEffect(() => {
    scrollToBottom('auto');
  }, [conversationId]);

  useEffect(() => {
    setMessages(chatMessages);
    setShouldScrollToBottom(true);
    setCursor(initialCursor);
    setHasMore(!!initialCursor);
  }, [conversationId]);

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom('smooth');
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  useChatSocket(conversationId, (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    setShouldScrollToBottom(true);

    router.invalidate({
      filter: (route) => route.routeId === '/_dashboard/chat',
    });
  });

  const messageForm = useForm({
    defaultValues: {
      message: '',
    },
    onSubmit: async ({ value }) => {
      const trimmedMessage = value.message.trim();

      if (!currentUserId || !trimmedMessage) return;

      try {
        const savedMessage = await sendMessageFn({
          data: {
            conversationId,
            senderId: currentUserId!,
            content: trimmedMessage,
          },
        });
        socket.emit('send_message', savedMessage);
        messageForm.reset();
      } catch (error) {
        toast.error('Failed to send message. Please try again.');
        return;
      }
    },
  });

  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore || !cursor) return;

    try {
      setIsLoadingMore(true);
      const { messages: olderMessages, nextCursor: newCursor } =
        await getMessagesForConversationFn({
          data: { conversationId, cursor },
        });
      setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
      setCursor(newCursor);
      setHasMore(!!newCursor);
    } catch (error) {
      toast.error('Failed to load more messages. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    if (target.scrollTop < 50 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }

    if (target.scrollHeight - target.scrollTop - target.clientHeight < 100) {
      setIsAtBottom(true);
    } else {
      setIsAtBottom(false);
    }
  };

  const shouldShowDateSeparator = (
    currentMessage: MessageWithSender,
    previousMessage: MessageWithSender | null,
  ) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();

    return currentDate !== previousDate;
  };

  return (
    <div className="flex-1 h-full overflow-hidden">
      <div className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm h-full overflow-hidden">
        <header className="p-6 border-b flex items-center gap-4">
          <Avatar>
            <AvatarImage src={conversationInfo?.otherUserImage ?? undefined} />
            <AvatarFallback>
              {conversationInfo?.otherUserName?.[0] ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-semibold">
            {conversationInfo?.otherUserName || 'Unknown User'}
          </h1>
        </header>

        <ScrollArea
          key={conversationId}
          className="flex-1 min-h-0 px-6 py-1"
          onScroll={handleScroll}
        >
          <div className="flex flex-col gap-3">
            {isLoadingMore && (
              <div className="flex justify-center py-3">
                <Spinner className="h-8 w-8" />
              </div>
            )}
            {messages.length ? (
              messages.map((message, index) => (
                <React.Fragment key={message.messageId}>
                  {shouldShowDateSeparator(message, messages[index - 1]) && (
                    <div className="flex justify-center my-4">
                      <span className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    content={message.content}
                    isOwn={message.senderId === currentUserId}
                    senderName={message.senderName}
                    senderImage={message.senderImage}
                    timestamp={message.createdAt}
                  />
                </React.Fragment>
              ))
            ) : (
              <div className="flex justify-center items-center h-full mt-10 text-muted-foreground font-semibold">
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={scrollRef} />
            <div
              className={cn(
                'absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out p-2 rounded-full bg-muted-foreground/30 cursor-pointer',
                isAtBottom
                  ? 'opacity-0 translate-y-4 pointer-events-none'
                  : 'opacity-100 translate-y-0',
              )}
              onClick={() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ArrowDown className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </ScrollArea>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            messageForm.handleSubmit();
          }}
          className="flex gap-4 items-center p-6"
        >
          <messageForm.Field name="message">
            {(field) => (
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Type your message..."
                autoComplete="off"
              />
            )}
          </messageForm.Field>

          <messageForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? (
                  <>
                    <Spinner /> Sending...
                  </>
                ) : (
                  'Send'
                )}
              </Button>
            )}
          </messageForm.Subscribe>
        </form>
      </div>
    </div>
  );
}
