export const logger = {
  info: (...args: any[]) => console.log('[admin-api]', ...args),
  warn: (...args: any[]) => console.warn('[admin-api]', ...args),
  error: (...args: any[]) => console.error('[admin-api]', ...args),
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[admin-api]', ...args);
    }
  },
};
