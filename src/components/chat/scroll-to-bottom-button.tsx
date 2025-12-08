import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

interface ScrollToButtomButtonProps {
  isAtBottom: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ScrollToBottomButton({ isAtBottom, scrollRef }: ScrollToButtomButtonProps) {
  return (
    <div
      className={cn(
        'bg-muted-foreground/30 absolute bottom-0 left-1/2 -translate-x-1/2 transform cursor-pointer rounded-full p-2 transition-all duration-300 ease-in-out',
        isAtBottom ? 'pointer-events-none translate-y-4 opacity-0' : 'translate-y-0 opacity-100',
      )}
      onClick={() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      <ArrowDown className="h-6 w-6" strokeWidth={2.5} />
    </div>
  );
}
