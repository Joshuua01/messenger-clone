import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageAttachment } from '@/lib/types';
import { cn, formatTime, getInitials } from '@/lib/utils';
import { FileAttachments } from './file-attachements';
import { ImageGallery } from './image-gallery';

interface MessageBubbleProps {
  content: string | null;
  attachments?: MessageAttachment[] | null;
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
  attachments,
}: MessageBubbleProps) => {
  const imageAttachments = attachments?.filter((a) => a.type.startsWith('image/')) || [];
  const otherAttachments = attachments?.filter((a) => !a.type.startsWith('image/')) || [];

  return (
    <div
      className={cn(
        'grid max-w-[65%] gap-x-2 gap-y-1',
        isOwn ? 'grid-cols-1 self-end' : 'grid-cols-[auto_1fr] self-start',
      )}
    >
      {!isOwn && senderName && <div />}
      {!isOwn && senderName && (
        <span className="text-muted-foreground px-1 text-xs">{senderName}</span>
      )}

      {!isOwn && senderName && (
        <Avatar className="h-10 w-10 shrink-0 self-end">
          <AvatarImage src={senderImage || undefined} alt={senderName} />
          <AvatarFallback className="text-xs">{getInitials(senderName)}</AvatarFallback>
        </Avatar>
      )}
      {content && (
        <div
          className={cn(
            'w-fit max-w-full rounded-lg px-3 py-2 wrap-break-word',
            isOwn
              ? 'bg-primary text-primary-foreground justify-self-end'
              : 'bg-muted text-foreground justify-self-start',
          )}
        >
          {content}
        </div>
      )}

      {imageAttachments.length > 0 && <ImageGallery images={imageAttachments} isOwn={isOwn} />}

      {otherAttachments.length > 0 && (
        <FileAttachments attachments={otherAttachments} isOwn={isOwn} />
      )}

      {!isOwn && senderName && <div />}
      <span
        className={cn('text-muted-foreground px-1 text-xs', isOwn ? 'text-right' : 'text-left')}
      >
        {formatTime(timestamp)}
      </span>
    </div>
  );
};
