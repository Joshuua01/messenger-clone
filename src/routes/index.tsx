import { ChatRoom } from '@/components/chat-room';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const [username, setUsername] = useState<string>('Anonim');

  useEffect(() => {
    const name = prompt('Podaj swoją nazwę użytkownika:');
    setUsername(name || 'Anonim');
  }, []);

  return (
    <div>
      <ChatRoom chatId="123" username={username} />
    </div>
  );
}
