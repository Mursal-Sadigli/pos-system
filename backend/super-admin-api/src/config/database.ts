import { Pool } from 'pg';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const sanitizeUrl = (url: string | undefined): string | undefined => {
  if (!url) return url;
  
  // Remove all whitespace characters, zero-width spaces, and BOM
  let sanitized = url.replace(/[\s\u200b\u200c\u200d\ufeff]/g, '');
  
  if (sanitized.startsWith('"') && sanitized.endsWith('"')) {
    sanitized = sanitized.slice(1, -1);
  }
  if (sanitized.startsWith("'") && sanitized.endsWith("'")) {
    sanitized = sanitized.slice(1, -1);
  }
  
  sanitized = sanitized.replace(/[\s\u200b\u200c\u200d\ufeff]/g, '');
  return sanitized;
};

const runUrlDiagnostics = (url: string) => {
  try {
    new URL(url);
    logger.info('DATABASE_URL has a valid URL format');
  } catch (err: any) {
    const hasProtocol = url.startsWith('postgres://') || url.startsWith('postgresql://');
    const hasAt = url.includes('@');
    const parts = url.split('@');
    const beforeAt = parts[0] || '';
    const afterAt = parts.slice(1).join('@');
    
    // Check for unusual or invisible characters
    const unusualChars: string[] = [];
    for (let i = 0; i < url.length; i++) {
      const code = url.charCodeAt(i);
      if (code < 32 || code > 126) {
        unusualChars.push(`char[${i}]=code:${code}`);
      }
    }
    
    logger.error(`DATABASE_URL diagnostic: 
      length=${url.length}
      hasProtocol=${hasProtocol}
      hasAt=${hasAt}
      unusualChars=[${unusualChars.join(', ')}]
      beforeAtLength=${beforeAt.length}
      afterAtLength=${afterAt.length}
      errorMessage="${err?.message}"
    `);
  }
};

const databaseUrl = sanitizeUrl(process.env.DATABASE_URL);

if (databaseUrl) {
  runUrlDiagnostics(databaseUrl);
}

const poolConfig: any = {
  connectionString: databaseUrl,
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
};

export const dbSchema = (() => {
  if (!databaseUrl) return 'public';
  const match = databaseUrl.match(/[?&]schema=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : 'public';
})();

export const schemaQualified = `"${dbSchema.replace(/"/g, '""')}"`;
export const schemaIdentifier = dbSchema ? `"${dbSchema.replace(/"/g, '""')}"` : '"public"';

if (dbSchema && dbSchema !== 'public') {
  poolConfig.options = `-c search_path='${dbSchema}',public`;
}

// Only enable SSL when explicitly requested via environment variable.
if (process.env.DB_SSL && process.env.DB_SSL.toLowerCase() === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.info('🗄️  Database connected');
});

pool.on('error', (err) => {
  logger.error('❌ Database error:', err);
});

pool.on('connect', (client) => {
  if (dbSchema && dbSchema !== 'public') {
    client.query(`SET search_path TO ${schemaIdentifier},public`).catch((err) => {
      logger.error('❌ Failed to set search_path:', err);
    });
  }
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`📊 Query (${duration}ms):`, text.substring(0, 100));
    }
    return result;
  } catch (error) {
    logger.error('❌ Query error:', error);
    throw error;
  }
};

export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const ensureInvitationTable = async () => {
  const client = await pool.connect();
  const schemaIdentifier = `"${dbSchema.replace(/"/g, '""')}"`;

  try {
    if (dbSchema && dbSchema !== 'public') {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaIdentifier}`);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}."invitations" (
        id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        store_id UUID,
        invited_by UUID NOT NULL,
        token VARCHAR(500) NOT NULL,
        password VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        expires_at TIMESTAMP NOT NULL,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}."users" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'CASHIER',
        permissions JSONB DEFAULT '[]'::jsonb,
        store_id UUID,
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        must_change_password BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        invitation_token VARCHAR(500),
        invitation_expires_at TIMESTAMP,
        invited_by UUID,
        last_login TIMESTAMP,
        refresh_token VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_invitations_email_status" ON ${schemaQualified}."invitations"(email, status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_invitations_token" ON ${schemaQualified}."invitations"(token)`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_invitations_store_id" ON ${schemaQualified}."invitations"(store_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_invitations_invited_by" ON ${schemaQualified}."invitations"(invited_by)`);
  } catch (error: any) {
    if (error?.code === '42501' || error?.message?.includes('permission denied')) {
      logger.warn(`⚠️ Skipping invitation table creation because DB user has no permission on schema ${dbSchema}. Cədvəli manual olaraq yaratmalısınız.`);
      return;
    }
    throw error;
  } finally {
    client.release();
  }
};

export const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    await ensureInvitationTable();
    logger.info('✅ Database connection successful');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export default { query, transaction, pool };