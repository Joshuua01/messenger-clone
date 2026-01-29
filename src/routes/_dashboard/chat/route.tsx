import { ChatItem } from '@/components/chat/chat-item';
import { SidebarSection } from '@/components/sidebar/sidebar-section';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { usePaginatedChats } from '@/hooks/use-paginated-chats';
import { usePresence } from '@/hooks/use-presence';
import { useUserSocket } from '@/hooks/use-user-socket';
import { getSessionFn } from '@/lib/fn/auth-fn';
import { getCurrentUserChatsFn } from '@/lib/fn/chat-fn';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Route = createFileRoute('/_dashboard/chat')({
  component: RouteComponent,
  loader: async () => {
    try {
      const [chats, currentSession] = await Promise.all([
        getCurrentUserChatsFn({ data: {} }),
        getSessionFn(),
      ]);
      return {
        chats: chats.chats,
        nextCursor: chats.nextCursor,
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
  const { chats: initialChats, nextCursor: initialCursor, currentUserId } = Route.useLoaderData();

  const { chats, hasMore, isLoading, loadMore } = usePaginatedChats({
    initialChats,
    initialCursor,
  });

  const trackedUsersIds = useMemo(
    () => [...new Set(chats.flatMap((c) => c.participants.map((p) => p.userId)))],
    [chats],
  );

  useUserSocket(currentUserId);
  const presence = usePresence(trackedUsersIds);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
    if (isAtBottom && hasMore && !isLoading) {
      loadMore();
    }
  };

  return (
    <div className="flex h-full flex-1 gap-2">
      <div className="flex h-full w-96 shrink-0 flex-col">
        <SidebarSection title="Recent Chats" description="View and manage your recent chats.">
          <ScrollArea className="h-full" onScroll={handleScroll}>
            {chats.length > 0 ? (
              <>
                {chats.map((chat) => (
                  <ChatItem
                    chat={chat}
                    isOnline={chat.participants.some((p) => presence[p.userId])}
                    key={chat.id}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
                No chats found. Start a new chat!
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
