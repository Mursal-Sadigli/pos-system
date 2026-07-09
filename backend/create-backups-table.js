const { query } = require('./src/lib/db');

async function up() {
  try {
    console.log('Creating backups table...');
    await query(`
      CREATE TABLE IF NOT EXISTS backups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        size_bytes BIGINT NOT NULL,
        status VARCHAR(50) DEFAULT 'COMPLETED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('backups table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating backups table:', err);
    process.exit(1);
  }
}

up();
