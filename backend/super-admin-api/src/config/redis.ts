import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

// No Redis client – all cache operations are no‑ops.
const redisClient = {
  // Methods used elsewhere are defined as async no‑ops.
  connect: async () => {},
  quit: async () => {},
  get: async (_key: string): Promise<string | null> => null,
  set: async (_key: string, _value: string): Promise<void> => {},
  setex: async (_key: string, _ttl: number, _value: string): Promise<void> => {},
  del: async (...keys: string[]): Promise<void> => {},
  exists: async (_key: string): Promise<boolean> => false,
  keys: async (_pattern: string): Promise<string[]> => [],
};

export const cache = {
  get: async (key: string): Promise<string | null> => await redisClient.get(key),
  set: async (key: string, value: string, ttl?: number) => {
    if (ttl) await redisClient.setex(key, ttl, value);
    else await redisClient.set(key, value);
  },
  del: async (key: string) => await redisClient.del(key),
  exists: async (key: string) => await redisClient.exists(key),
  clearPattern: async (pattern: string) => {
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(...keys);
  },
};

export { redisClient };