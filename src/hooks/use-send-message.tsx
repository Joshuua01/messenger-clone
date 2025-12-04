import { sendMessageFn } from '@/lib/fn/conversation-fn';
import { socket } from '@/lib/socket';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseSendMessageOptions {
  conversationId: string;
  currentUserId?: string;
  otherUserId: string;
}

export function useSendMessage({
  conversationId,
  currentUserId,
  otherUserId,
}: UseSendMessageOptions) {
  return useCallback(
    async (content: string) => {
      if (!currentUserId) return;
      try {
        const savedMessage = await sendMessageFn({
          data: {
            conversationId,
            senderId: currentUserId,
            content: content,
          },
        });
        socket.emit('send_message', savedMessage);
        socket.emit('notify_chat', [currentUserId, otherUserId]);
      } catch (error) {
        toast.error('Failed to send message. Please try again.');
        return;
      }
    },
    [conversationId, currentUserId, otherUserId],
  );
}
