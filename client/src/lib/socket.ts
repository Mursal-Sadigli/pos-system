import { io, type Socket } from 'socket.io-client';

const SOCKET_URL =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL)) ||
  'http://localhost:5000';

let socket: Socket | null = null;

function buildSocket(): Socket {
  const s = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: false,
  });

  s.on('connect', () => {
    console.log('[Socket] Connected:', s.id);
    // Join user's personal room after connecting
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const userId = payload.id || payload.userId || payload.sub;
          if (userId) {
            s.emit('join', { userId });
            console.log('[Socket] Joined room:', userId);
          }
        }
      } catch (e) {
        console.warn('[Socket] Token parse error:', e);
      }
    }
  });

  s.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  s.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return s;
}

export function getSocket(): Socket {
  if (!socket) {
    socket = buildSocket();
  }
  return socket;
}

// Alias for backwards compat with useSocket.ts
export function initSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}