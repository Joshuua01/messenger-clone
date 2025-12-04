import { cn, formatTime, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  senderName?: string;
  senderImage?: string | null;
  timestamp: Date;
}

export const MessageBubble = ({
  content,
  isOwn,
  senderName,
  senderImage,
  timestamp,
}: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        'grid gap-x-2 gap-y-1 max-w-[65%]',
        isOwn ? 'self-end grid-cols-1' : 'self-start grid-cols-[auto_1fr]',
      )}
    >
      {!isOwn && senderName && <div />}
      {!isOwn && senderName && (
        <span className="text-xs text-muted-foreground px-1">{senderName}</span>
      )}

      {!isOwn && senderName && (
        <Avatar className="h-10 w-10 shrink-0 self-end">
          <AvatarImage src={senderImage || undefined} alt={senderName} />
          <AvatarFallback className="text-xs">
            {getInitials(senderName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'px-3 py-2 rounded-lg wrap-break-word max-w-full w-fit',
          isOwn
            ? 'bg-primary text-primary-foreground justify-self-end'
            : 'bg-muted text-foreground justify-self-start',
        )}
      >
        {content}
      </div>

      {!isOwn && senderName && <div />}
      <span
        className={cn(
          'text-xs text-muted-foreground px-1',
          isOwn ? 'text-right' : 'text-left',
        )}
      >
        {formatTime(timestamp)}
      </span>
    </div>
  );
};
