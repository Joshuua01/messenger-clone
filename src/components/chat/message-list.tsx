import { MessageWithSender } from '@/lib/types';
import { formatDate, shouldShowDateSeparator } from '@/lib/utils';
import { MessageBubble } from './message-bubble';
import React from 'react';
import { Spinner } from '../ui/spinner';

interface MessageListProps {
  isLoading: boolean;
  messages: MessageWithSender[];
  currentUserId?: string;
}

export function MessageList({ isLoading, messages, currentUserId }: MessageListProps) {
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
              <div className="flex justify-center my-4">
                <span className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">
                  {formatDate(message.createdAt)}
                </span>
              </div>
            )}
            <MessageBubble
              content={message.content}
              isOwn={message.senderId === currentUserId}
              senderName={message.senderName}
              senderImage={message.senderImage}
              timestamp={message.createdAt}
            />
          </React.Fragment>
        ))
      ) : (
        <div className="flex justify-center items-center h-full mt-10 text-muted-foreground font-semibold">
          No messages yet. Start the conversation!
        </div>
      )}
    </>
  );
}
