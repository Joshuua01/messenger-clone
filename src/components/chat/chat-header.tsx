import { cn, getInitials } from '@/lib/utils';
import { ChatSelect } from '@/server/db/schema';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ChatSettingsDialog } from './chat-settings-dialog';

interface ChatHeaderProps {
  isOnline: boolean;
  participants: {
    id: string;
    name: string;
    image: string | null;
  }[];
  chatInfo: ChatSelect;
}

export function ChatHeader({ isOnline, participants, chatInfo }: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b p-6">
      {chatInfo.imageUrl ? (
        <Avatar key={chatInfo.id} className={cn(isOnline && 'ring-3 ring-green-500')}>
          <AvatarImage src={chatInfo.imageUrl ?? undefined} />
          <AvatarFallback>{getInitials(chatInfo.name ?? '')}</AvatarFallback>
        </Avatar>
      ) : (
        participants.map((participant) => (
          <Avatar key={participant.id} className={cn(isOnline && 'ring-3 ring-green-500')}>
            <AvatarImage src={participant.image ?? undefined} />
            <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
          </Avatar>
        ))
      )}
      <h1 className="flex-1 text-xl font-semibold">
        {chatInfo.name ? chatInfo.name : participants.map((p) => p.name).join(', ')}
      </h1>
      <ChatSettingsDialog chatInfo={chatInfo} />
    </header>
  );
}
