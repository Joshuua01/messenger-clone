import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

interface ScrollToButtomButtonProps {
  isAtBottom: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ScrollToButtomButton({ isAtBottom, scrollRef }: ScrollToButtomButtonProps) {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out p-2 rounded-full bg-muted-foreground/30 cursor-pointer',
        isAtBottom ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0',
      )}
      onClick={() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      <ArrowDown className="h-6 w-6" strokeWidth={2.5} />
    </div>
  );
}
