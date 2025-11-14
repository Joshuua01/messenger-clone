import { MessageBubble } from '@/components/chat/message-bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { getSessionFn } from '@/lib/fn/auth-fn';
import {
  getMessagesForConversationFn,
  sendMessageFn,
} from '@/lib/fn/conversation-fn';
import { socket } from '@/lib/socket';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_dashboard/chat/$chatId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { chatId } = params;
    const [chatMessages, currentSession] = await Promise.all([
      getMessagesForConversationFn({ data: chatId }),
      getSessionFn(),
    ]);
    return {
      chatMessages,
      currentUserId: currentSession.session.data?.user.id,
    };
  },
});

function RouteComponent() {
  const { chatId: conversationId } = Route.useParams();
  const { chatMessages, currentUserId } = Route.useLoaderData();
  const [messages, setMessages] = useState(chatMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const messageForm = useForm({
    defaultValues: {
      message: '',
    },
    onSubmit: async ({ value }) => {
      const trimmedMessage = value.message.trim();

      if (!currentUserId || !trimmedMessage) return;

      try {
        const savedMessage = await sendMessageFn({
          data: {
            conversationId,
            senderId: currentUserId!,
            content: trimmedMessage,
          },
        });
        socket.emit('send_message', savedMessage);
        messageForm.reset();

        await router.invalidate();
      } catch (error) {
        toast.error('Failed to send message. Please try again.');
        return;
      }
    },
  });

  useChatSocket(conversationId, (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  });

  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages, conversationId]);

  return (
    <div className="flex-1 h-full overflow-hidden">
      <div className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm h-full overflow-hidden">
        <header className="p-6 border-b">
          <h1 className="text-xl font-semibold">Chat</h1>
        </header>

        <ScrollArea className="flex-1 min-h-0 px-6 py-1">
          <div className="flex flex-col gap-3">
            {messages.length ? (
              messages.map((message) => (
                <MessageBubble
                  key={message.messageId}
                  content={message.content}
                  isOwn={message.senderId === currentUserId}
                  senderName={message.senderName}
                  senderImage={message.senderImage}
                  timestamp={message.createdAt}
                />
              ))
            ) : (
              <div className="flex justify-center items-center h-full mt-10 text-muted-foreground font-semibold">
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            messageForm.handleSubmit();
          }}
          className="flex gap-4 items-center p-6"
        >
          <messageForm.Field name="message">
            {(field) => (
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Type your message..."
                autoComplete="off"
              />
            )}
          </messageForm.Field>

          <messageForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? (
                  <>
                    <Spinner /> Sending...
                  </>
                ) : (
                  'Send'
                )}
              </Button>
            )}
          </messageForm.Subscribe>
        </form>
      </div>
    </div>
  );
}
