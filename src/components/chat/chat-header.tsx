import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ChatHeaderProps {
  isOnline: boolean;
  userName: string;
  imageUrl: string | null;
}

export function ChatHeader({ isOnline, userName, imageUrl }: ChatHeaderProps) {
  return (
    <header className="p-6 border-b flex items-center gap-4">
      <Avatar className={cn(isOnline && 'ring-3 ring-green-500')}>
        <AvatarImage src={imageUrl ?? undefined} />
        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
      </Avatar>
      <h1 className="text-xl font-semibold">{userName}</h1>
    </header>
  );
}
