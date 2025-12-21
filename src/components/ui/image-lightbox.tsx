import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: { url: string; name: string }[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setScale(1);
    }
  }, [open, initialIndex]);

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setScale(1);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setScale(1);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.5, 0.5));

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentImage.name || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case 'ArrowLeft':
          if (hasMultiple) goToPrevious();
          break;
        case 'ArrowRight':
          if (hasMultiple) goToNext();
          break;
        case 'Escape':
          onOpenChange(false);
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
      }
    },
    [open, hasMultiple],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!currentImage) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/90"
          onClick={() => onOpenChange(false)}
        />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col items-center justify-center outline-none"
          onPointerDownOutside={() => onOpenChange(false)}
        >
          <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4">
            <div className="max-w-[50%] truncate text-sm font-medium text-white">
              {currentImage.name}
              {hasMultiple && (
                <span className="ml-2 text-white/70">
                  ({currentIndex + 1} / {images.length})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                title="Zoom out (-)"
              >
                <ZoomOutIcon className="size-5" />
              </button>
              <span className="min-w-[3rem] text-center text-sm text-white">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                title="Zoom in (+)"
              >
                <ZoomInIcon className="size-5" />
              </button>
              <button
                onClick={handleDownload}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                title="Download"
              >
                <DownloadIcon className="size-5" />
              </button>
              <DialogPrimitive.Close
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                title="Close (Esc)"
              >
                <XIcon className="size-5" />
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Navigation arrows */}
          {hasMultiple && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                title="Previous (←)"
              >
                <ChevronLeftIcon className="size-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                title="Next (→)"
              >
                <ChevronRightIcon className="size-6" />
              </button>
            </>
          )}

          <div
            className="flex h-full w-full items-center justify-center overflow-auto p-16"
            onClick={(e) => {
              if (e.target === e.currentTarget) onOpenChange(false);
            }}
          >
            <img
              src={currentImage.url}
              alt={currentImage.name}
              className={cn(
                'max-h-full max-w-full object-contain transition-transform duration-200 select-none',
                scale !== 1 && 'cursor-move',
              )}
              style={{ transform: `scale(${scale})` }}
              draggable={false}
            />
          </div>

          {hasMultiple && (
            <div className="absolute right-0 bottom-0 left-0 z-10 flex items-center justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent p-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setScale(1);
                  }}
                  className={cn(
                    'size-12 overflow-hidden rounded-md border-2 transition-all',
                    idx === currentIndex
                      ? 'border-white opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <img src={img.url} alt={img.name} className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
