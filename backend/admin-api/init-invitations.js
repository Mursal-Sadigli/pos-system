const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://user:password@localhost:5432/pos_db' });
client.connect().then(async () => {
  const sql = `CREATE TABLE IF NOT EXISTS admin.invitations (id UUID PRIMARY KEY, email VARCHAR(255) NOT NULL, role VARCHAR(50) NOT NULL, store_id UUID, token VARCHAR(255) NOT NULL, status VARCHAR(20) DEFAULT 'PENDING', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, expires_at TIMESTAMP NOT NULL, used_at TIMESTAMP, invited_by UUID);`;
  await client.query(sql);
  console.log('Invitations created');
  client.end();
}).catch(e => {
  console.error('Error:', e);
  client.end();
});
