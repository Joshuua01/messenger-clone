import { MessageWithSender } from '@/lib/types';
import { Server } from 'socket.io';

const io = new Server({
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

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
});

io.listen(4000);
console.log('Socket.IO server running on port 4000');
