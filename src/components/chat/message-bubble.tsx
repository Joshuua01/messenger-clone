import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { MessageAttachment } from '@/lib/types';
import { cn, formatTime, getInitials } from '@/lib/utils';

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const imageAttachments = attachments?.filter((a) => a.type.startsWith('image/')) || [];
  const otherAttachments = attachments?.filter((a) => !a.type.startsWith('image/')) || [];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

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

      {imageAttachments.length > 0 && (
        <div
          className={cn(
            'grid gap-1 overflow-hidden rounded-lg',
            isOwn ? 'justify-self-end' : 'justify-self-start',
            imageAttachments.length === 1 && 'grid-cols-1',
            imageAttachments.length === 2 && 'grid-cols-2',
            imageAttachments.length >= 3 && 'grid-cols-2',
          )}
        >
          {imageAttachments.map((attachment, index) => (
            <button
              key={attachment.id}
              onClick={() => openLightbox(index)}
              className={cn(
                'relative cursor-pointer overflow-hidden rounded-md transition-opacity hover:opacity-90',
                imageAttachments.length === 1 && 'max-w-xs',
                imageAttachments.length === 3 && index === 0 && 'row-span-2',
              )}
            >
              <img
                src={attachment.url}
                alt={attachment.name}
                className="h-full max-h-64 w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {otherAttachments.length > 0 && (
        <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
          {otherAttachments.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-opacity hover:opacity-80',
                isOwn ? 'bg-primary/80 text-primary-foreground' : 'bg-muted text-foreground',
              )}
            >
              <span className="max-w-[200px] truncate">{attachment.name}</span>
            </a>
          ))}
        </div>
      )}

      <ImageLightbox
        images={imageAttachments.map((a) => ({ url: a.url, name: a.name }))}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      {!isOwn && senderName && <div />}
      <span
        className={cn('text-muted-foreground px-1 text-xs', isOwn ? 'text-right' : 'text-left')}
      >
        {formatTime(timestamp)}
      </span>
    </div>
  );
};
