import { socket } from '@/lib/socket';
import { useEffect, useMemo, useState } from 'react';

export function usePresence(ids: Array<string>) {
  const userIds = useMemo(() => Array.from(new Set(ids)), [ids]);
  const [state, setState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userIds.length === 0) return;

    if (!socket.connected) socket.connect();

    const handleUpdate = ({
      userId,
      online,
    }: {
      userId: string;
      online: boolean;
    }) => {
      if (!userIds.includes(userId)) return;

      setState((prev) => ({
        ...prev,
        [userId]: online,
      }));
    };

    const requestSnapshot = () => {
      socket.emit(
        'request_presence',
        userIds,
        (presence: { userId: string; online: boolean }[]) => {
          setState((prev) => {
            const newState = { ...prev };
            presence.forEach(({ userId, online }) => {
              newState[userId] = online;
            });
            return newState;
          });
        },
      );
    };

    requestSnapshot();

    socket.on('user_presence', handleUpdate);
    socket.on('connect', requestSnapshot);

    return () => {
      socket.off('user_presence', handleUpdate);
      socket.off('connect', requestSnapshot);
    };
  }, [userIds]);

  return state;
}
