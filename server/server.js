const { Server } = require('socket.io');

const io = new Server(4000, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  let currentRoom = null;

  // 🔁 Join a specific room
  socket.on('join-room', (roomId) => {
    if (currentRoom) {
      socket.leave(currentRoom);
    }
    currentRoom = roomId;
    socket.join(roomId);
    console.log(`✅ Socket ${socket.id} joined room ${roomId}`);
  });

  // 📝 Sticky Note Events
  socket.on('note-added', (note) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('note-added', note);
      console.log(`➕ Note added by ${note.user} in ${currentRoom}`);
    }
  });

  socket.on('note-updated', ({ id, content }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('note-updated', { id, content });
      console.log(`✏️ Note ${id} updated in ${currentRoom}`);
    }
  });

  socket.on('note-deleted', (id) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('note-deleted', id);
      console.log(`🗑️ Note ${id} deleted in ${currentRoom}`);
    }
  });

  socket.on('note-moved', ({ id, delta }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('note-moved', { id, delta });
      console.log(`📦 Note ${id} moved in ${currentRoom}`);
    }
  });

  // 🎨 Whiteboard Drawing Sync
  socket.on('draw-line', (data) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('draw-line', data);
      console.log(`🎨 Line drawn in ${currentRoom}`);
    }
  });

  // 🔌 Optional: Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Socket ${socket.id} disconnected from room ${currentRoom}`);
  });
});
