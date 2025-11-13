import { useEffect } from 'react';

import { socket } from '@/lib/socket';
import type { MessageWithSender } from '@/lib/types';

export function useChatSocket(
  conversationId: string | undefined,
  onMessage: (message: MessageWithSender) => void,
) {
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleIncomingMessage = (message: MessageWithSender) => {
      onMessage(message);
    };

    socket.emit('join_chat', conversationId);
    socket.on('new_message', handleIncomingMessage);

    return () => {
      socket.emit('leave_chat', conversationId);
      socket.off('new_message', handleIncomingMessage);
    };
  }, [conversationId]);
}
