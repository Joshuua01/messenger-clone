import { getCurrentUserChatsFn } from '@/lib/fn/chat-fn';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UsePaginatedChatsOptions {
  initialChats: {
    id: string;
    lastMessage: string | null;
    updatedAt: Date;
    otherUserId: string;
    otherUserName: string;
    otherUserImage: string | null;
  }[];
  initialCursor: string | undefined;
}

export function usePaginatedChats({ initialChats, initialCursor }: UsePaginatedChatsOptions) {
  const [chats, setChats] = useState(initialChats);
  const [isLoading, setIsLoading] = useState(false);

  const cursorRef = useRef(initialCursor);
  const hasMoreRef = useRef(!!initialCursor);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    setChats(initialChats);
    cursorRef.current = initialCursor;
    hasMoreRef.current = !!initialCursor;
    isLoadingRef.current = false;
    setIsLoading(false);
  }, [initialChats, initialCursor]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || isLoadingRef.current || !cursorRef.current) return;

    try {
      setIsLoading(true);
      isLoadingRef.current = true;
      const { chats: olderChats, nextCursor } = await getCurrentUserChatsFn({
        data: { cursor: cursorRef.current },
      });
      setChats((prevChats) => [...prevChats, ...olderChats]);
      cursorRef.current = nextCursor;
      hasMoreRef.current = !!nextCursor;
    } catch {
      toast.error('Failed to load more chats. Please try again.');
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  return {
    chats,
    loadMore,
    hasMore: hasMoreRef.current,
    isLoading,
  };
}
