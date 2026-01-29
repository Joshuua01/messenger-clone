import { sendMessageFn } from '@/lib/fn/chat-fn';
import { uploadMessageAttachmentFn } from '@/lib/fn/upload-fn';
import { socket } from '@/lib/socket';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseSendMessageOptions {
  chatId: string;
  currentUserId?: string;
  participantsIds: string[];
}

export function useSendMessage({ chatId, currentUserId, participantsIds }: UseSendMessageOptions) {
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentUserId) return;
      try {
        const savedMessage = await sendMessageFn({
          data: {
            chatId,
            senderId: currentUserId,
            content: content,
          },
        });
        socket.emit('send_message', savedMessage);
        socket.emit('notify_chat', [currentUserId, ...participantsIds]);
      } catch (error) {
        toast.error('Failed to send message. Please try again.');
        return;
      }
    },
    [chatId, currentUserId, participantsIds],
  );

  const sendAttachments = useCallback(
    async (files: File[]) => {
      if (!currentUserId) return;

      try {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        const attachements = await uploadMessageAttachmentFn({ data: formData });
        const savedMessage = await sendMessageFn({
          data: {
            chatId,
            senderId: currentUserId,
            content: null,
            attachments: attachements,
          },
        });
        socket.emit('send_message', savedMessage);
        socket.emit('notify_chat', [currentUserId, ...participantsIds]);
      } catch (error: any) {
        toast.error(`Failed to upload attachments: ${error.message}`);
        return;
      }
    },
    [chatId, currentUserId, participantsIds],
  );

  return { sendMessage, sendAttachments };
}
