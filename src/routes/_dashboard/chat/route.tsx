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

export const Route = createFileRoute('/_dashboard/chat')({
  component: RouteComponent,
  loader: async () => {
    try {
      return await getCurrentUserConversationsFn();
    } catch (err) {
      if (err instanceof Response && err.status === 401) {
        throw redirect({ to: '/login' });
      }
      throw err;
    }
  },
});

function RouteComponent() {
  const conversations = Route.useLoaderData();
  const navigate = useNavigate();
  const location = useLocation().pathname.slice(6);

  return (
    <div className="flex flex-1 h-full gap-2">
      <div className="w-96 shrink-0 h-full flex flex-col">
        <SidebarSection
          title="Recent Chats"
          description="View and manage your recent conversations."
        >
          <ScrollArea className="h-full">
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
