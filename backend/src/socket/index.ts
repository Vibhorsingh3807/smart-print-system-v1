import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { CONFIG } from '../config/index.js';

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join:user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 Socket ${socket.id} joined user room: user:${userId}`);
      }
    });

    socket.on('join:admin', () => {
      socket.join('admin:queue');
      console.log(`🛡️ Socket ${socket.id} joined admin queue room`);
    });

    socket.on('join:agent', (agentKey: string) => {
      if (agentKey === CONFIG.AGENT_API_KEY) {
        socket.join('agent:printers');
        console.log(`🖨️ Socket ${socket.id} authenticated as Print Agent`);
      } else {
        socket.disconnect();
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const notifyUser = (userId: string, event: string, data: any): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const notifyAdminQueue = (event: string, data: any): void => {
  if (io) {
    io.to('admin:queue').emit(event, data);
  }
};

export const notifyPrintAgent = (event: string, data: any): void => {
  if (io) {
    io.to('agent:printers').emit(event, data);
  }
};
