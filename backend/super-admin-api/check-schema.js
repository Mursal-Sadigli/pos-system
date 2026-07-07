const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://user:password@localhost:5432/pos_db' });
client.connect().then(async () => {
  try {
    const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pos_order_items'`);
    console.log('pos_order_items:', res.rows);
    const res2 = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pos_orders'`);
    console.log('pos_orders:', res2.rows);
  } catch(e) {
    console.error(e);
  }
  client.end();
});
