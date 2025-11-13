import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
}

export const MessageBubble = ({ content, isOwn }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg max-w-3/5',
        isOwn
          ? 'bg-primary/20 self-end'
          : 'bg-primary/80 self-start text-white',
      )}
    >
      {content}
    </div>
  );
};
