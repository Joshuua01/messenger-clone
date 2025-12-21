import { MessageAttachment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Badge } from '../ui/badge';

interface ImageGalleryProps {
  images: MessageAttachment[];
  isOwn: boolean;
}

export function ImageGallery({ images, isOwn }: ImageGalleryProps) {
  const mainImage = images[0];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const handleLightboxClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
      setIndex(0);
    }
  };

  return (
    <div className={cn('relative', isOwn ? 'self-end' : 'self-start')}>
      <img
        src={mainImage.url}
        alt="Attachment"
        className={cn('relative h-auto w-64 cursor-pointer rounded-md object-cover')}
        onClick={() => setOpen(!open)}
      />
      {images.length > 1 && (
        <Badge className="absolute right-2 bottom-2" variant={'secondary'}>
          +{images.length - 1} more image{images.length - 1 > 1 ? 's' : ''}
        </Badge>
      )}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/80"
          onClick={handleLightboxClose}
        >
          <img
            src={images[index].url}
            alt="Attachment"
            className="max-h-[80vh] max-w-[90vw] cursor-pointer rounded-md object-contain"
          />
          <div className="bg-accent flex gap-4 rounded-4xl px-4 py-3">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'hover:bg-primary bg-muted-foreground cursor-pointer rounded-full p-2 transition-all',
                  idx == index && 'bg-primary',
                )}
                onClick={() => setIndex(idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
