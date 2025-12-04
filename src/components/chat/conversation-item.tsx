import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ConversationItemProps {
  conversation: {
    id: string;
    lastMessage: string | null;
    updatedAt: Date;
    otherUserId: string;
    otherUserName: string;
    otherUserImage: string | null;
  };
  isOnline?: boolean;
}

export function ConversationItem({ conversation, isOnline }: ConversationItemProps) {
  const navigate = useNavigate();
  const location = useLocation().pathname.slice(6);
  return (
    <div
      key={conversation.id}
      className={cn(
        'hover:bg-accent flex cursor-pointer items-center gap-4 rounded-md px-2 py-3 transition-colors',
        {
          'bg-accent': location === conversation.id,
        },
      )}
      onClick={() =>
        navigate({
          to: `/chat/${conversation.id}`,
        })
      }
    >
      <Avatar className={cn('h-12 w-12', isOnline && 'ring-3 ring-green-500')}>
        <AvatarImage src={conversation.otherUserImage ?? undefined} />
        <AvatarFallback>{conversation.otherUserName?.[0] ?? 'U'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{conversation.otherUserName}</h3>
        <p className="text-muted-foreground max-w-[220px] truncate text-sm">
          {conversation.lastMessage ?? 'No messages yet.'}
        </p>
      </div>
    </div>
  );
}
