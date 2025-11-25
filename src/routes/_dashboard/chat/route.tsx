import { SidebarSection } from '@/components/sidebar/sidebar-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCurrentUserConversationsFn } from '@/lib/fn/conversation-fn';
import { cn } from '@/lib/utils';
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_dashboard/chat')({
  component: RouteComponent,
  loader: async () => {
    try {
      return await getCurrentUserConversationsFn({ data: {} });
    } catch (err) {
      if (err instanceof Response && err.status === 401) {
        throw redirect({ to: '/login' });
      }
      throw err;
    }
  },
});

function RouteComponent() {
  const { conversations: initialConversations, nextCursor: initialCursor } =
    Route.useLoaderData();
  const navigate = useNavigate();
  const location = useLocation().pathname.slice(6);
  const [conversations, setConversations] = useState(initialConversations);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialCursor);

  useEffect(() => {
    setConversations(initialConversations);
    setCursor(initialCursor);
    setHasMore(!!initialCursor);
  }, [initialConversations, initialCursor]);

  const loadMoreChats = async () => {
    if (!hasMore || isLoadingMore || !cursor) return;

    try {
      setIsLoadingMore(true);
      const { conversations: olderChats, nextCursor: newCursor } =
        await getCurrentUserConversationsFn({
          data: { cursor },
        });
      setConversations((prevConversations) => [
        ...prevConversations,
        ...olderChats,
      ]);
      setCursor(newCursor);
      setHasMore(!!newCursor);
    } catch (error) {
      toast.error('Failed to load more conversations. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
    if (isAtBottom && hasMore && !isLoadingMore) {
      loadMoreChats();
      console.log('at bottom');
    }
  };

  return (
    <div className="flex flex-1 h-full gap-2">
      <div className="w-96 shrink-0 h-full flex flex-col">
        <SidebarSection
          title="Recent Chats"
          description="View and manage your recent conversations."
        >
          <ScrollArea className="h-full" onScroll={handleScroll}>
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.conversationId}
                  className={cn(
                    'flex gap-4 px-2 py-3 items-center hover:bg-accent rounded-md cursor-pointer transition-colors',
                    {
                      'bg-accent': location === conversation.conversationId,
                    },
                  )}
                  onClick={() =>
                    navigate({
                      to: `/chat/${conversation.conversationId}`,
                    })
                  }
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={conversation.otherUserImage ?? undefined}
                    />
                    <AvatarFallback>
                      {conversation.otherUserName?.[0] ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">
                      {conversation.otherUserName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate max-w-[220px]">
                      {conversation.lastMessage ?? 'No messages yet.'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-sm text-muted-foreground flex justify-center items-center">
                No conversations found. Start a new chat!
              </div>
            )}
          </ScrollArea>
        </SidebarSection>
      </div>

      <div className="flex-1 flex">
        <Outlet />
      </div>
    </div>
  );
}
