import { useEffect, useRef } from 'react';
import { initSocket } from '@/lib/socket';

/**
 * Socket hadisəsini dinləyir.
 * @param event   - Socket event adı
 * @param callback - Hadisə baş verdikdə çağırılan funksiya
 */
export function useSocket(event: string, callback: (...args: any[]) => void) {
  const callbackRef = useRef(callback);

  // Always keep ref up-to-date without re-subscribing
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const socket = initSocket();

    const handler = (...args: any[]) => {
      callbackRef.current(...args);
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
      // Do NOT disconnect here — shared singleton should stay alive
    };
  }, [event]);
}