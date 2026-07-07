const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://user:password@localhost:5432/pos_db' });
client.connect().then(async () => {
  const hash = await bcrypt.hash('12345abc', 10);
  await client.query('UPDATE admin.users SET password = $1 WHERE email = $2', [hash, 'fullmursel2025@gmail.com']);
  console.log('Password updated successfully');
  client.end();
}).catch(e => {
  console.error('Error:', e);
  client.end();
});
