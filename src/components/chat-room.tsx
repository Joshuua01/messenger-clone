import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ChatRoom({
  chatId,
  username,
}: {
  chatId: string;
  username: string;
}) {
  const [messages, setMessages] = useState<
    { username: string; message: string }[]
  >([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.connect();
    socket.emit('join_chat', chatId);

    socket.on('message', (msg) => {
      console.log('💬 Received message from server:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit('leave_chat', chatId);
      socket.off('message');
    };
  }, [chatId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('send_message', { chatId, username, message: input });
    setInput('');
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-2xl shadow bg-white">
      <div className="h-64 overflow-y-auto border p-2 mb-3 rounded">
        {messages.map((m, i) => (
          <div key={i} className="text-sm mb-1">
            <b>{m.username}:</b> {m.message}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          placeholder="Napisz wiadomość..."
        />
        <Button onClick={sendMessage}>Wyślij</Button>
      </div>
    </div>
  );
}
