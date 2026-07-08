import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || '';
export const dbSchema = (() => {
  if (!databaseUrl) return 'public';
  const match = databaseUrl.match(/[?&]schema=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : 'public';
})();

export const schemaQualified = `"${dbSchema.replace(/"/g, '""')}"`;

// Remove ?schema=... from connectionString for Neon compatibility
const cleanConnectionString = (url: string) => url.replace(/[?&]schema=[^&]*/g, '').replace(/[?&]$/, '');

const rawUrl = process.env.DATABASE_URL || '';
const isNeon = rawUrl.includes('neon.tech');

const pool = new Pool({
  connectionString: cleanConnectionString(rawUrl),
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  ssl: isNeon ? { rejectUnauthorized: false } : undefined,
});

pool.on('connect', () => logger.info('🗄️  Admin API database connected'));
pool.on('error', (err: any) => {
  if (err.message === 'Connection terminated unexpectedly') {
    // Ignore Neon's idle connection termination
    return;
  }
  logger.error('❌ Database error:', err);
});

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
    await pool.query(`ALTER TABLE ${schemaQualified}.users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)`);
    await pool.query(`ALTER TABLE ${schemaQualified}.users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
    await pool.query(`ALTER TABLE ${schemaQualified}.stores ADD COLUMN IF NOT EXISTS role_permissions JSONB DEFAULT '{"MANAGER": ["sales_view", "inventory_manage", "store_settings"], "CASHIER": ["pos_access", "sales_view_own"], "VIEWER": ["sales_view", "inventory_view"]}'::jsonb`);
    await pool.query(`ALTER TABLE ${schemaQualified}.stores ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0`);
    // Notification preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}.notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        preferences JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES ${schemaQualified}.users(id) ON DELETE CASCADE
      )
    `);
    logger.info('✅ Admin API database connection successful');
  } catch (error: any) {
    if (error?.code === '42501' || error?.message?.includes('permission denied')) {
      logger.warn('⚠️ Could not alter stores table - missing permission. Continuing...');
      return;
    }
    logger.error('❌ Admin API database connection failed', error);
    throw error;
  }
};


export default { query, connectDB };
