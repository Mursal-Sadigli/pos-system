const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  const sql = `
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10),
    ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
  `;
  await client.query(sql);
  console.log('✅ Added otp_code and otp_expires_at to users table.');
  
  client.end();
}).catch(e => {
  console.error('Error:', e);
  client.end();
});
