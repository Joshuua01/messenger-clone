import { cn, formatRelativeTime } from '@/lib/utils';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface ChatItemProps {
  chat: {
    id: string;
    lastMessage: string | null;
    updatedAt: Date;
    type: 'private' | 'group';
    lastReadAt: Date | null;
    unreadCount: number;
    participants: {
      chatId: string;
      userId: string;
      userName: string;
      userImage: string | null;
    }[];
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
        <AvatarImage src={chat.participants[0]?.userImage ?? undefined} />
        <AvatarFallback>{chat.participants[0]?.userName?.[0] ?? 'U'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex">
          <h3 className="max-w-55 flex-1 truncate text-lg font-semibold">
            {chat.participants.map((p) => p.userName).join(', ')}
          </h3>
          {chat.unreadCount > 0 && (
            <Badge variant={'secondary'}>{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</Badge>
          )}
        </div>
        <div
          className={cn(
            'flex items-center gap-2 text-sm',
            chat.unreadCount > 0 ? 'text-primary font-semibold' : 'text-muted-foreground',
          )}
        >
          <div className="max-w-55 flex-1 truncate">{chat.lastMessage ?? 'No messages yet.'}</div>
          <div>{formatRelativeTime(chat.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
}
