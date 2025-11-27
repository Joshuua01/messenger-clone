import { useEffect, useRef, useState } from 'react';

import { socket } from '@/lib/socket';
import type { MessageWithSender } from '@/lib/types';

export function useChatSocket(
  conversationId: string,
  currentUserId: string,
  onMessage: (message: MessageWithSender) => void,
) {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingUsersRef = useRef<Set<string>>(new Set());
  const isEmittingTypingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleIncomingMessage = (message: MessageWithSender) => {
      onMessage(message);
    };

    const handleUserTyping = (userId: string) => {
      typingUsersRef.current.add(userId);
      setIsTyping(typingUsersRef.current.size > 0);
    };

    const handleUserStopTyping = (userId: string) => {
      typingUsersRef.current.delete(userId);
      setIsTyping(typingUsersRef.current.size > 0);
    };

    socket.emit('join_chat', conversationId);
    socket.on('new_message', handleIncomingMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.emit('leave_chat', conversationId);
      socket.off('new_message', handleIncomingMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [conversationId, currentUserId]);

  const emitTyping = () => {
    if (!isEmittingTypingRef.current) {
      socket.emit('typing', conversationId, currentUserId);
      isEmittingTypingRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', conversationId, currentUserId);
      isEmittingTypingRef.current = false;
    }, 2000);
  };

  return { isTyping, emitTyping };
}
