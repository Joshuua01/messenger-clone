import { MessageWithSender } from '@/lib/types';
import { Server } from 'socket.io';

const io = new Server({
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const onlineUsers = new Map<string, Set<string>>();

const markOnline = (userId: string, socketId: string) => {
  const sockets = onlineUsers.get(userId) ?? new Set<string>();
  const wasOffline = sockets.size === 0;

  sockets.add(socketId);
  onlineUsers.set(userId, sockets);

  if (wasOffline) {
    io.emit('user_presence', { userId, online: true });
  }
};

const markOffline = (userId: string, socketId: string) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    io.emit('user_presence', { userId, online: false });
  }
};

io.on('connection', (socket) => {
  socket.on('join_chat', (conversationId: string) => {
    socket.join(`chat:${conversationId}`);
  });

  socket.on('leave_chat', (conversationId: string) => {
    socket.leave(`chat:${conversationId}`);
  });

  socket.on('send_message', (message: MessageWithSender) => {
    io.to(`chat:${message.conversationId}`).emit('new_message', message);
  });

  socket.on('join_user_room', (userId: string) => {
    socket.join(`user:${userId}`);
    markOnline(userId, socket.id);
    socket.data.userId = userId;
  });

  socket.on(
    'request_presence',
    (userIds: string[], callback: (presence: { userId: string; online: boolean }[]) => void) => {
      const presence = userIds.map((userId) => ({
        userId,
        online: onlineUsers.has(userId),
      }));
      callback(presence);
    },
  );

  socket.on('leave_user_room', (userId: string) => {
    socket.leave(`user:${userId}`);
    markOffline(userId, socket.id);
    socket.data.userId = null;
  });

  socket.on('notify_chat', (participantsId: string[]) => {
    for (const userId of participantsId) {
      io.to(`user:${userId}`).emit('conversation_updated');
    }
  });

  socket.on('typing', (conversationId: string, userId: string) => {
    socket.to(`chat:${conversationId}`).emit('user_typing', userId);
  });

  socket.on('stop_typing', (conversationId: string, userId: string) => {
    socket.to(`chat:${conversationId}`).emit('user_stop_typing', userId);
  });

  socket.on('disconnect', () => {
    console.log(`Socket ID ${socket.id} disconnecting`);
    const userId = socket.data.userId;
    if (userId) {
      markOffline(userId, socket.id);
    }
  });
});

io.listen(4000);
console.log('Socket.IO server running on port 4000');
