require('dotenv').config();
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);

async function run() {
  await client.connect();
  let res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'stores'`);
  console.log("stores:", res.rows);
  
  res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pos_orders'`);
  console.log("pos_orders:", res.rows);
  
  await client.end();
}
run().catch(console.error);
