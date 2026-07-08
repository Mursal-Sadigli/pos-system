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
  
  try {
    const protocolEndIndex = sanitized.indexOf('://');
    const lastAtIndex = sanitized.lastIndexOf('@');
    if (protocolEndIndex !== -1 && lastAtIndex > protocolEndIndex) {
      const protocol = sanitized.substring(0, protocolEndIndex);
      const userinfo = sanitized.substring(protocolEndIndex + 3, lastAtIndex);
      const hostAndDb = sanitized.substring(lastAtIndex + 1);
      
      const colonIndex = userinfo.indexOf(':');
      let username = userinfo;
      let password = '';
      if (colonIndex !== -1) {
        username = userinfo.substring(0, colonIndex);
        password = userinfo.substring(colonIndex + 1);
      }
      
      let encodedUser = '';
      let encodedPass = '';
      try {
        const decodedUser = decodeURIComponent(username);
        const decodedPass = decodeURIComponent(password);
        encodedUser = encodeURIComponent(decodedUser);
        encodedPass = encodeURIComponent(decodedPass);
      } catch (err) {
        encodedUser = encodeURIComponent(username);
        encodedPass = encodeURIComponent(password);
      }
      
      sanitized = `${protocol}://${encodedUser}:${encodedPass}@${hostAndDb}`;
    }
  } catch (e) {
    // Ignore and return sanitized string
  }
  
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

const parseConnectionString = (url: string) => {
  const protocolEndIndex = url.indexOf('://');
  if (protocolEndIndex === -1) return null;
  
  const protocol = url.substring(0, protocolEndIndex);
  if (protocol !== 'postgres' && protocol !== 'postgresql') return null;
  
  const lastAtIndex = url.lastIndexOf('@');
  if (lastAtIndex === -1 || lastAtIndex < protocolEndIndex) return null;
  
  const userinfo = url.substring(protocolEndIndex + 3, lastAtIndex);
  const hostPortDbQuery = url.substring(lastAtIndex + 1);
  
  const slashIndex = hostPortDbQuery.indexOf('/');
  if (slashIndex === -1) return null;
  
  const hostPort = hostPortDbQuery.substring(0, slashIndex);
  const dbQuery = hostPortDbQuery.substring(slashIndex + 1);
  
  const questionIndex = dbQuery.indexOf('?');
  const database = questionIndex === -1 ? dbQuery : dbQuery.substring(0, questionIndex);
  
  const colonIndex = userinfo.indexOf(':');
  let user = userinfo;
  let password = '';
  if (colonIndex !== -1) {
    user = userinfo.substring(0, colonIndex);
    password = userinfo.substring(colonIndex + 1);
  }
  
  const hostColonIndex = hostPort.lastIndexOf(':');
  let host = hostPort;
  let port = '5432';
  if (hostColonIndex !== -1) {
    host = hostPort.substring(0, hostColonIndex);
    port = hostPort.substring(hostColonIndex + 1);
  }
  
  return {
    user: decodeURIComponent(user),
    password: decodeURIComponent(password),
    host: host,
    port: parseInt(port) || 5432,
    database: decodeURIComponent(database)
  };
};

const databaseUrl = sanitizeUrl(process.env.DATABASE_URL);

if (databaseUrl) {
  runUrlDiagnostics(databaseUrl);
}

const poolConfig: any = {
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
};

if (databaseUrl) {
  const parsed = parseConnectionString(databaseUrl);
  if (parsed) {
    poolConfig.user = parsed.user;
    poolConfig.password = parsed.password;
    poolConfig.host = parsed.host;
    poolConfig.port = parsed.port;
    poolConfig.database = parsed.database;
  } else {
    poolConfig.connectionString = databaseUrl;
  }
}

export const dbSchema = (() => {
  if (!databaseUrl) return 'public';
  const match = databaseUrl.match(/[?&]schema=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : 'public';
})();

export const schemaQualified = `"${dbSchema.replace(/"/g, '""')}"`;
export const schemaIdentifier = dbSchema ? `"${dbSchema.replace(/"/g, '""')}"` : '"public"';

// search_path option removed for Neon compatibility

// Enable SSL when requested, or if sslmode=require/neon.tech is in the connection URL
if (
  (process.env.DB_SSL && process.env.DB_SSL.toLowerCase() === 'true') ||
  (databaseUrl && (databaseUrl.includes('sslmode=require') || databaseUrl.includes('ssl=true') || databaseUrl.includes('neon.tech')))
) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.info('🗄️  Database connected');
});

pool.on('error', (err: any) => {
  if (err.message === 'Connection terminated unexpectedly') {
    // Ignore Neon's idle connection termination
    return;
  }
  logger.error('❌ Database error:', err);
});

// search_path setting removed – Neon does not support it

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}."products" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE,
        category VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}."stores" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        tax_number VARCHAR(100),
        registration_number VARCHAR(100),
        timezone VARCHAR(100) DEFAULT 'Asia/Baku',
        currency VARCHAR(10) DEFAULT 'AZN',
        language VARCHAR(10) DEFAULT 'az',
        business_type VARCHAR(100),
        website VARCHAR(255),
        store_code VARCHAR(50),
        manager_name VARCHAR(255),
        contact_phone VARCHAR(50),
        work_start VARCHAR(20),
        work_end VARCHAR(20),
        work_days JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}."pos_orders" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(100) UNIQUE,
        customer_name VARCHAR(255) DEFAULT 'Gündəlik Müştəri',
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'completed',
        payment VARCHAR(50) DEFAULT 'Nağd',
        cashier VARCHAR(100) DEFAULT 'Kassa',
        source VARCHAR(50) DEFAULT 'POS',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaQualified}."pos_order_items" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES ${schemaQualified}."pos_orders"(id) ON DELETE CASCADE,
        product_id UUID,
        name VARCHAR(255) NOT NULL,
        qty INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add cost_price columns if they don't exist (for existing tables)
    await client.query(`ALTER TABLE ${schemaQualified}."products" ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0`);
    await client.query(`ALTER TABLE ${schemaQualified}."pos_order_items" ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0`);
    await client.query(`ALTER TABLE ${schemaQualified}."pos_orders" ADD COLUMN IF NOT EXISTS store_id UUID`);

    await client.query(`ALTER TABLE ${schemaQualified}."stores" ADD COLUMN IF NOT EXISTS store_code VARCHAR(50)`);
    await client.query(`ALTER TABLE ${schemaQualified}."stores" ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255)`);
    await client.query(`ALTER TABLE ${schemaQualified}."stores" ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)`);
    await client.query(`ALTER TABLE ${schemaQualified}."stores" ADD COLUMN IF NOT EXISTS work_start VARCHAR(20)`);
    await client.query(`ALTER TABLE ${schemaQualified}."stores" ADD COLUMN IF NOT EXISTS work_end VARCHAR(20)`);
    await client.query(`ALTER TABLE ${schemaQualified}."stores" ADD COLUMN IF NOT EXISTS work_days JSONB`);
    await client.query(`ALTER TABLE ${schemaQualified}."stores" ADD COLUMN IF NOT EXISTS role_permissions JSONB DEFAULT '{"MANAGER": ["sales_view", "inventory_manage", "store_settings"], "CASHIER": ["pos_access", "sales_view_own"], "VIEWER": ["sales_view", "inventory_view"]}'::jsonb`);
    await client.query(`ALTER TABLE ${schemaQualified}."stores" ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0`);
    
    // Add columns for user profile
    await client.query(`ALTER TABLE ${schemaQualified}."users" ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)`);
    await client.query(`ALTER TABLE ${schemaQualified}."users" ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
    
    // Mock initial cost_price for existing products
    await client.query(`UPDATE ${schemaQualified}."products" SET cost_price = price * 0.7 WHERE cost_price = 0 OR cost_price IS NULL`);
    await client.query(`UPDATE ${schemaQualified}."pos_order_items" SET cost_price = price * 0.7 WHERE cost_price = 0 OR cost_price IS NULL`);

    await client.query(`CREATE INDEX IF NOT EXISTS "idx_pos_orders_status" ON ${schemaQualified}."pos_orders"(status)`);
    await client.query(`ALTER TABLE ${schemaQualified}."pos_orders" ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'POS'`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_pos_order_items_order_id" ON ${schemaQualified}."pos_order_items"(order_id)`);
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
    if (poolConfig.host === 'host') {
      logger.warn('⚠️ DATABASE_URL contains placeholder host "host". Please replace it with your actual database URL in the Render Environment Variables!');
    }
    await pool.query('SELECT 1');
    await ensureInvitationTable();
    logger.info('✅ Database connection successful');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export default { query, transaction, pool };