import { io, type Socket } from 'socket.io-client';

// Yalnız backend URL-i — frontend port 3000, backend port 5000
const SOCKET_URL =
  (typeof process !== 'undefined' &&
    (process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL)) ||
  'http://localhost:5001';

let socket: Socket | null = null;

function joinRoom(s: Socket) {
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    const parts = token.split('.');
    if (parts.length !== 3) return;

    const payload = JSON.parse(atob(parts[1]));
    const userId = payload.id || payload.userId || payload.sub;
    if (userId) {
      s.emit('join', { userId });
      console.log('[Socket] Joined room:', userId);
    }
  } catch (e) {
    console.warn('[Socket] Token parse error:', e);
  }
}

function buildSocket(): Socket {
  const s = io(SOCKET_URL, {
    // polling → sonra websocket-ə upgrade — ən etibarlı üsul
    transports: ['polling', 'websocket'],
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  s.on('connect', () => {
    console.log('[Socket] Connected:', s.id);
    joinRoom(s);
  });

  s.on('joined', (data: { userId: string; socketId: string }) => {
    console.log('[Socket] Room confirmed:', data);
  });

  s.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  s.on('connect_error', (err) => {
    // Sadəcə log et, qırmızı xəta deyil
    console.warn('[Socket] Connection error:', err.message);
  });

  return s;
}

/** Mövcud socket-i qaytar, yoxdursa yarat */
export function getSocket(): Socket {
  if (!socket) {
    socket = buildSocket();
  }
  return socket;
}

/** Socket-i qaytar və qoşulduğundan əmin ol */
export function initSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

/** Singleton-i tamamilə kəs (logout-da istifadə et) */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}