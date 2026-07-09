require('dotenv').config();
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);

async function run() {
  await client.connect();
  let res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'`);
  console.log("products:", res.rows);
  await client.end();
}
run().catch(console.error);
