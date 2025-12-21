export type MessageAttachment = {
  id: string;
  url: string;
  name: string;
  type: string;
};

export type MessageWithSender = {
  messageId: string;
  chatId: string;
  content: string | null;
  createdAt: Date;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  attachments: MessageAttachment[] | null;
};
