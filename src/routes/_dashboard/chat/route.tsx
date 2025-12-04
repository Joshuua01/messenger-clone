import { SidebarSection } from '@/components/sidebar/sidebar-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePresence } from '@/hooks/use-presence';
import { useUserSocket } from '@/hooks/use-user-socket';
import { getSessionFn } from '@/lib/fn/auth-fn';
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
      const [conversations, currentSession] = await Promise.all([
        getCurrentUserConversationsFn({ data: {} }),
        getSessionFn(),
      ]);
      return {
        conversations: conversations.conversations,
        nextCursor: conversations.nextCursor,
        currentUserId: currentSession.session.data?.user.id,
      };
    } catch (err) {
      if (err instanceof Response && err.status === 401) {
        throw redirect({ to: '/login' });
      }
      throw err;
    }
  },
});

function RouteComponent() {
  const {
    conversations: initialConversations,
    nextCursor: initialCursor,
    currentUserId,
  } = Route.useLoaderData();
  const navigate = useNavigate();
  const location = useLocation().pathname.slice(6);
  const [conversations, setConversations] = useState(initialConversations);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialCursor);
  const trackedUsersIds = conversations.map((c) => c.otherUserId);

  useUserSocket(currentUserId);
  const presence = usePresence(trackedUsersIds);

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
      setConversations((prevConversations) => [...prevConversations, ...olderChats]);
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
    <div className="flex h-full flex-1 gap-2">
      <div className="flex h-full w-96 shrink-0 flex-col">
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
                    'hover:bg-accent flex cursor-pointer items-center gap-4 rounded-md px-2 py-3 transition-colors',
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
                  <Avatar
                    className={cn(
                      'h-12 w-12',
                      presence[conversation.otherUserId] && 'ring-3 ring-green-500',
                    )}
                  >
                    <AvatarImage src={conversation.otherUserImage ?? undefined} />
                    <AvatarFallback>{conversation.otherUserName?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{conversation.otherUserName}</h3>
                    <p className="max-w-[220px] truncate text-sm text-gray-500">
                      {conversation.lastMessage ?? 'No messages yet.'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
                No conversations found. Start a new chat!
              </div>
            )}
          </ScrollArea>
        </SidebarSection>
      </div>

      <div className="flex flex-1">
        <Outlet />
      </div>
    </div>
  );
}
