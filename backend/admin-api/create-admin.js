const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://user:password@localhost:5432/pos_db' });
client.connect().then(async () => {
  const hash = await bcrypt.hash('sadigli2024!', 10);
  const storeRes = await client.query('INSERT INTO public.stores (name, address, phone) VALUES ($1, $2, $3) RETURNING id', ['Mursel Store', 'Baku', '+994500000000']);
  const storeId = storeRes.rows[0].id;
  await client.query('INSERT INTO admin.users (name, email, password, role, store_id) VALUES ($1, $2, $3, $4, $5)', ['Mursel Admin', 'fullmursel2025@gmail.com', hash, 'ADMIN', storeId]);
  console.log('Admin user created successfully');
  client.end();
}).catch(e => {
  console.error('Error:', e);
  client.end();
});
