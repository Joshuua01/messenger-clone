import { socket } from '@/lib/socket';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

export function useUserSocket(userId: string | undefined) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_user_room', userId);
    socket.on('chat_updated', () => {
      router.invalidate({
        filter: (route) => route.routeId === '/_dashboard/chat',
      });
    });

    return () => {
      socket.emit('leave_user_room', userId);
      socket.off('chat_updated');
    };
  }, [userId]);
}
