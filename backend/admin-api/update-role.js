const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://user:password@localhost:5432/pos_db' });
client.connect().then(async () => {
  await client.query('UPDATE super_admin.users SET role = $1 WHERE email = $2', ['ADMIN', 'fullmursel2025@gmail.com']);
  console.log('Role updated');
  client.end();
}).catch(e => {
  console.error('Error:', e);
  client.end();
});
