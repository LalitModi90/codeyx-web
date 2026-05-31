import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export let io: SocketIOServer;

export const getSocketIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized yet');
  }
  return io;
};

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin === process.env.FRONTEND_URL) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Allow user to join a room specific to their clerkUserId
    socket.on('join_user_room', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room.`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper function to emit events to a specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};
