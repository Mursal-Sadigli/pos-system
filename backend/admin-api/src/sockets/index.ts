import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import app from '../app';
import { corsOptions } from '../config/cors';
import { logger } from '../config/logger';

const httpServer = http.createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  pingTimeout: 20000,
  pingInterval: 10000,
  transports: ['polling', 'websocket'],
});

io.on('connection', (socket: Socket) => {
  logger.info(`[Socket] Client connected: ${socket.id}`);

  socket.on('join', ({ userId }: { userId: string }) => {
    if (userId) {
      socket.join(userId);
      logger.info(`[Socket] User ${userId} joined room (socket: ${socket.id})`);
      socket.emit('joined', { userId, socketId: socket.id });
    }
  });

  socket.on('disconnect', (reason) => {
    logger.info(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
  });
});

export function emitNotification(
  userId: string,
  notification: {
    id?: string;
    title: string;
    message?: string;
    type?: 'info' | 'warning' | 'success' | 'order' | 'stock';
    data?: any;
  }
) {
  io.to(userId).emit('notification', {
    id: notification.id || `notif-${Date.now()}`,
    title: notification.title,
    message: notification.message || '',
    type: notification.type || 'info',
    data: notification.data || null,
    createdAt: new Date().toISOString(),
  });
}

export { httpServer };
