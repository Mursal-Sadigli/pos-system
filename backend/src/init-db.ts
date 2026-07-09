import { query } from './lib/db';

async function initDB() {
  try {
    console.log('Creating products table...');
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 0,
        category VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Products table created successfully!');

    console.log('Creating general_settings table...');
    await query(`
      CREATE TABLE IF NOT EXISTS general_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        system_name VARCHAR(255) DEFAULT 'POS System',
        default_language VARCHAR(50) DEFAULT 'az',
        default_timezone VARCHAR(100) DEFAULT 'Asia/Baku',
        default_currency VARCHAR(10) DEFAULT 'AZN',
        maintenance_mode BOOLEAN DEFAULT false,
        allow_registration BOOLEAN DEFAULT false,
        enable_email_notifications BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Insert default settings if not exists (singleton)
    await query(`
      INSERT INTO general_settings (id) 
      SELECT gen_random_uuid() 
      WHERE NOT EXISTS (SELECT 1 FROM general_settings);
    `);
    console.log('General settings table created successfully!');

  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    process.exit(0);
  }
}

initDB();
