const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://user:password@localhost:5432/pos_db' });
client.connect().then(async () => {
  const hash = await bcrypt.hash('12345abc', 10);
  await client.query('INSERT INTO super_admin.users (name, email, password, role) VALUES ($1, $2, $3, $4)', ['Mursel Admin', 'fullmursel2025@gmail.com', hash, 'SUPER_ADMIN']);
  console.log('Copied to super_admin.users');
  client.end();
}).catch(e => {
  console.error('Error:', e);
  client.end();
});
