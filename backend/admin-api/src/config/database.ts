import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
});

pool.on('connect', () => logger.info('🗄️  Admin API database connected'));
pool.on('error', (err) => logger.error('❌ Admin API database error:', err));

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      logger.info(`📦 Query executed in ${duration}ms`);
    }
    return result;
  } catch (error) {
    logger.error('❌ Query failed:', error);
    throw error;
  }
};

export const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    await pool.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)`);
    await pool.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
    logger.info('✅ Admin API database connection successful');
  } catch (error) {
    logger.error('❌ Admin API database connection failed', error);
    throw error;
  }
};

export default { query, connectDB };
