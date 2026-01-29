import { MessageWithSender } from '@/lib/types';
import { formatDate, shouldShowDateSeparator } from '@/lib/utils';
import React from 'react';
import { Spinner } from '../ui/spinner';
import { MessageBubble } from './message-bubble';

interface MessageListProps {
  isLoading: boolean;
  messages: MessageWithSender[];
  currentUserId?: string;
}

export function MessageList({ isLoading, messages, currentUserId }: MessageListProps) {
  const shouldShowTimeStamp = (
    message: MessageWithSender,
    nextMessage: MessageWithSender | undefined,
  ) => {
    if (!nextMessage) return true;
    if (message.senderId !== nextMessage.senderId) return true;

    const diff = new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime();
    return diff > 60 * 1000;
  };

  return (
    <>
      {isLoading && (
        <div className="flex justify-center py-3">
          <Spinner className="h-8 w-8" />
        </div>
      )}
      {messages.length ? (
        messages.map((message, index) => (
          <React.Fragment key={message.messageId}>
            {shouldShowDateSeparator(message, messages[index - 1]) && (
              <div className="my-4 flex justify-center">
                <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                  {formatDate(message.createdAt)}
                </span>
              </div>
            )}
            <MessageBubble
              content={message.content}
              attachments={message.attachments}
              isOwn={message.senderId === currentUserId}
              senderName={message.senderName}
              senderImage={message.senderImage}
              timestamp={message.createdAt}
              showTimestamp={shouldShowTimeStamp(message, messages[index + 1])}
            />
          </React.Fragment>
        ))
      ) : (
        <div className="text-muted-foreground mt-10 flex h-full items-center justify-center font-semibold">
          No messages yet. Start the chat!
        </div>
      )}
    </>
  );
}
