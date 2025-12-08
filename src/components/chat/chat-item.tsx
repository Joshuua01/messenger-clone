import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ChatItemProps {
  chat: {
    id: string;
    lastMessage: string | null;
    updatedAt: Date;
    otherUserId: string;
    otherUserName: string;
    otherUserImage: string | null;
  };
  isOnline?: boolean;
}

export function ChatItem({ chat, isOnline }: ChatItemProps) {
  const navigate = useNavigate();
  const location = useLocation().pathname.slice(6);
  return (
    <div
      key={chat.id}
      className={cn(
        'hover:bg-accent flex cursor-pointer items-center gap-4 rounded-md px-2 py-3 transition-colors',
        {
          'bg-accent': location === chat.id,
        },
      )}
      onClick={() =>
        navigate({
          to: `/chat/${chat.id}`,
        })
      }
    >
      <Avatar className={cn('h-12 w-12', isOnline && 'ring-3 ring-green-500')}>
        <AvatarImage src={chat.otherUserImage ?? undefined} />
        <AvatarFallback>{chat.otherUserName?.[0] ?? 'U'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{chat.otherUserName}</h3>
        <p className="text-muted-foreground max-w-[220px] truncate text-sm">
          {chat.lastMessage ?? 'No messages yet.'}
        </p>
      </div>
    </div>
  );
}
