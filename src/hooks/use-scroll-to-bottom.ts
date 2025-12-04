import { useCallback, useRef, useState } from 'react';

export function useScrollToBottom() {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  }, []);

  const checkScrollPosition = useCallback((target: HTMLDivElement) => {
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    setIsAtBottom(distanceFromBottom < 100);
  }, []);

  return { scrollRef, isAtBottom, scrollToBottom, checkScrollPosition };
}
