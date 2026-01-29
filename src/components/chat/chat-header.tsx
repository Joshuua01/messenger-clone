import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ChatHeaderProps {
  isOnline: boolean;
  participants: {
    id: string;
    name: string;
    image: string | null;
  }[];
}

export function ChatHeader({ isOnline, participants }: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b p-6">
      {participants.map((participant) => (
        <Avatar key={participant.id} className={cn(isOnline && 'ring-3 ring-green-500')}>
          <AvatarImage src={participant.image ?? undefined} />
          <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
        </Avatar>
      ))}
      <h1 className="text-xl font-semibold">
        {participants.map((participant) => participant.name).join(', ')}
      </h1>
    </header>
  );
}
