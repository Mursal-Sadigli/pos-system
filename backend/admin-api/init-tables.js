const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://user:password@localhost:5432/pos_db' });
client.connect().then(async () => {
  await client.query('GRANT ALL ON SCHEMA admin TO "user";');
  const sql = `CREATE TABLE IF NOT EXISTS admin.users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'CASHIER', store_id UUID, is_active BOOLEAN DEFAULT true, last_login TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
  await client.query(sql);
  console.log('Users created');
  client.end();
}).catch(e => {
  console.error('Error:', e);
  client.end();
});
