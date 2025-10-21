import { Server } from 'socket.io';

const io = new Server({
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_chat', (chatId: string) => {
    socket.join(`chat:${chatId}`);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  socket.on('leave_chat', (chatId: string) => {
    socket.leave(`chat:${chatId}`);
    console.log(`Socket ${socket.id} left chat ${chatId}`);
  });

  socket.on(
    'send_message',
    (data: { chatId: string; username: string; message: string }) => {
      const { chatId, username, message } = data;
      io.to(`chat:${chatId}`).emit('message', { username, message });
      console.log(`Message sent to chat ${chatId} by ${username}: ${message}`);
    },
  );

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

io.listen(4000);
console.log('Socket.IO server running on port 4000');
