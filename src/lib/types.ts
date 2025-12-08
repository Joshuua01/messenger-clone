export type MessageWithSender = {
  messageId: string;
  chatId: string;
  content: string;
  createdAt: Date;
  senderId: string;
  senderName: string;
  senderImage: string | null;
};
