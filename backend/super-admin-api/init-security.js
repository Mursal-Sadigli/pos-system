const { Client } = require('pg');
require('dotenv').config({ path: '../.env' }); // Load from backend/.env

const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
client.connect().then(async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS security_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      two_factor_auth BOOLEAN DEFAULT false,
      password_complexity BOOLEAN DEFAULT true,
      session_timeout INTEGER DEFAULT 30,
      max_login_attempts INTEGER DEFAULT 5,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client.query(sql);
  console.log('✅ security_settings table created or verified.');

  const checkSql = `SELECT COUNT(*) FROM security_settings`;
  const checkRes = await client.query(checkSql);
  
  if (parseInt(checkRes.rows[0].count) === 0) {
    const insertSql = `
      INSERT INTO security_settings (two_factor_auth, password_complexity, session_timeout, max_login_attempts) 
      VALUES (false, true, 30, 5)
    `;
    await client.query(insertSql);
    console.log('✅ Default security settings inserted.');
  } else {
    console.log('✅ Default security settings already exist.');
  }
  
  client.end();
}).catch(e => {
  console.error('Error:', e);
  client.end();
});
