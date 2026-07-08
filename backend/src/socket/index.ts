// backend/src/socket/index.ts
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import app from '../app';
import { allowedOrigins } from '../app';

const logger = {
  info: (...args: any[]) => console.log('[Socket]', ...args),
  error: (...args: any[]) => console.error('[Socket]', ...args),
};

// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Initialise Socket.IO server
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => origin.startsWith(o)) || origin.includes('localhost')) {
        return callback(null, true);
      }
      callback(new Error('Socket origin not allowed: ' + origin));
    },
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Connection handler ────────────────────────────────────────────────────────
io.on('connection', (socket: Socket) => {
  logger.info(`[Socket] Client connected: ${socket.id}`);

  // Client registers their userId to a personal room
  socket.on('join', ({ userId }: { userId: string }) => {
    if (userId) {
      socket.join(userId);
      logger.info(`[Socket] User ${userId} joined room (socket: ${socket.id})`);
      // Confirm join
      socket.emit('joined', { userId, socketId: socket.id });
    }
  });

  socket.on('disconnect', (reason) => {
    logger.info(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
  });
});

// Utility to emit a notification to a specific user
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

// Export the HTTP server so that server.ts can reuse it
export { httpServer };
