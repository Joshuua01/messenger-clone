import { cn, getInitials } from '@/lib/utils';
import { ChatSelect } from '@/server/db/schema';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ChatSettingsDialog } from './chat-settings-dialog';
import { AlertButton } from '../alert-button';
import { Button } from '../ui/button';
import { ArrowLeftFromLine, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { deleteChatFn, removeUserFromChatFn } from '@/lib/fn/chat-fn';
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '@/lib/auth-client';

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
  const navigate = useNavigate();
  const { data: session } = useSession();

  const handleChatDelete = async () => {
    try {
      await deleteChatFn({ data: chatInfo.id });
      toast.success('Chat deleted successfully');
      navigate({
        to: '/chat',
      });
    } catch (error: any) {
      toast.error(`Chat delete failed: ${error.message}`);
      return;
    }
  };

  const handleChatLeave = async () => {
    try {
      if (!session?.user.id) throw new Error('User not authenticated');
      await removeUserFromChatFn({ data: { chatId: chatInfo.id, userId: session?.user.id } });
      toast.success('You have left the chat');
      navigate({
        to: '/chat',
      });
    } catch (error: any) {
      toast.error(`Leave chat failed: ${error.message}`);
      return;
    }
  };

  return (
    <header className="flex items-center gap-2 border-b p-6">
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
      {chatInfo.type === 'group' && (
        <>
          <AlertButton
            title="Delete chat"
            description="Are you sure you want to delete this chat? This action cannot be undone."
            onClick={handleChatDelete}
          >
            <Button variant="destructive" size="icon-lg">
              <Trash />
            </Button>
          </AlertButton>
          <AlertButton
            title="Leave group"
            description="Are you sure you want to leave this group? You will no longer be able to access its messages."
            onClick={handleChatLeave}
          >
            <Button variant="outline" size="icon-lg">
              <ArrowLeftFromLine />
            </Button>
          </AlertButton>
        </>
      )}
      <ChatSettingsDialog chatInfo={chatInfo} />
    </header>
  );
}
