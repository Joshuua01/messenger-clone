export type MessageWithSender = {
  messageId: string;
  conversationId: string;
  content: string;
  createdAt: Date;
  senderId: string;
  senderName: string;
  senderImage: string | null;
};
