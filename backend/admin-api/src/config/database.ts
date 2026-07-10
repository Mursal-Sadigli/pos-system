import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || '';
export const dbSchema = 'public';

export const schemaQualified = `"${dbSchema}"`;

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
    // Security columns on users
    await pool.query(`ALTER TABLE ${schemaQualified}.users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255)`);
    await pool.query(`ALTER TABLE ${schemaQualified}.users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE ${schemaQualified}.users ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE ${schemaQualified}.users ADD COLUMN IF NOT EXISTS current_challenge VARCHAR(255)`);

    // Passkeys table for WebAuthn
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}.passkeys (
        id VARCHAR(255) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES ${schemaQualified}.users(id) ON DELETE CASCADE,
        public_key BYTEA NOT NULL,
        webauthn_user_id VARCHAR(255) NOT NULL,
        counter BIGINT NOT NULL DEFAULT 0,
        device_type VARCHAR(50) NOT NULL,
        backed_up BOOLEAN NOT NULL DEFAULT FALSE,
        transports VARCHAR(255),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Audit logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}.audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        store_id UUID REFERENCES ${schemaQualified}.stores(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES ${schemaQualified}.users(id) ON DELETE CASCADE
      )
    `);
    
    // In case the table already exists, add the column
    try {
      await pool.query(`ALTER TABLE ${schemaQualified}.audit_logs ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES ${schemaQualified}.stores(id) ON DELETE CASCADE`);
    } catch (e) {
      // Ignore if it already exists and syntax fails
    }

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON ${schemaQualified}.audit_logs(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_store_id ON ${schemaQualified}.audit_logs(store_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON ${schemaQualified}.audit_logs(action)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON ${schemaQualified}.audit_logs(created_at DESC)`);

    // FAQs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}.faqs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Support tickets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}.support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES ${schemaQualified}.stores(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES ${schemaQualified}.users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed some initial FAQs if table is empty
    const faqsCount = await pool.query(`SELECT COUNT(*) FROM ${schemaQualified}.faqs`);
    if (parseInt(faqsCount.rows[0].count, 10) === 0) {
      const initialFaqs = [
        ['Sifarişi necə ləğv edə bilərəm?', 'Sifarişlər bölməsinə daxil olun, müvafiq sifarişi seçin və "Ləğv et" düyməsini sıxın.', 'Sifarişlər'],
        ['Məhsulun stokunu necə yeniləyim?', 'Məhsullar bölməsində məhsulun üzərinə klikləyin, düzəliş et (Edit) edərək stok miqdarını dəyişin və yadda saxlayın.', 'Məhsullar'],
        ['Yeni istifadəçi (kassir) necə əlavə edim?', 'İstifadəçilər (Users) bölməsinə keçid edib, "Yeni istifadəçi əlavə et" düyməsindən istifadə edə bilərsiniz.', 'İstifadəçilər'],
        ['Hesabatları necə ixrac edim?', 'Hesabatlar bölməsində Excel və ya PDF ikonlarına basaraq cari hesabatı kompüterinizə yükləyə bilərsiniz.', 'Hesabatlar'],
      ];
      for (const faq of initialFaqs) {
        await pool.query(
          `INSERT INTO ${schemaQualified}.faqs (question, answer, category) VALUES ($1, $2, $3)`,
          [faq[0], faq[1], faq[2]]
        );
      }
    }

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
