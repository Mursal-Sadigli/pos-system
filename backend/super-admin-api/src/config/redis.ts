import Redis from 'ioredis';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connected');
});

redisClient.on('error', (error) => {
  logger.error('❌ Redis error:', error);
});

redisClient.on('close', () => {
  logger.warn('⚠️ Redis connection closed');
});

export const cache = {
  get: async (key: string): Promise<string | null> => {
    return await redisClient.get(key);
  },
  
  set: async (key: string, value: string, ttl?: number): Promise<void> => {
    if (ttl) {
      await redisClient.setex(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
  },
  
  del: async (key: string): Promise<void> => {
    await redisClient.del(key);
  },
  
  exists: async (key: string): Promise<boolean> => {
    const result = await redisClient.exists(key);
    return result === 1;
  },
  
  clearPattern: async (pattern: string): Promise<void> => {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  },
};