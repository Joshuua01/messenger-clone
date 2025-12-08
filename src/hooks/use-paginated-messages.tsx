import { getMessagesForChatFn } from '@/lib/fn/chat-fn';
import { MessageWithSender } from '@/lib/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UsePaginatedMessagesOptions {
  initialMessages: MessageWithSender[];
  initialCursor: string | undefined;
  chatId: string;
}

export function usePaginatedMessages({
  initialMessages,
  initialCursor,
  chatId,
}: UsePaginatedMessagesOptions) {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const cursorRef = useRef(initialCursor);
  const hasMoreRef = useRef(!!initialCursor);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    setMessages(initialMessages);
    cursorRef.current = initialCursor;
    hasMoreRef.current = !!initialCursor;
    isLoadingRef.current = false;
    setIsLoading(false);
  }, [chatId, initialMessages, initialCursor]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || isLoadingRef.current || !cursorRef.current) return;

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      const { messages: olderMessages, nextCursor } = await getMessagesForChatFn({
        data: { chatId, cursor: cursorRef.current },
      });
      setMessages((prev) => [...olderMessages, ...prev]);
      cursorRef.current = nextCursor;
      hasMoreRef.current = !!nextCursor;
    } catch (error) {
      toast.error('Failed to load more messages. Please try again.');
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [chatId]);

  const addMessage = useCallback((message: MessageWithSender) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    messages,
    loadMore,
    hasMore: hasMoreRef.current,
    isLoading,
    addMessage,
  };
}
