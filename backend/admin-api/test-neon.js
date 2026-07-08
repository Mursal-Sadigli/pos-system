const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_QYHt1wIKWRb4@ep-sweet-feather-asrfznv1-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require&options=-c%20search_path=admin' });
  await client.connect();
  const res = await client.query('SELECT current_schema()');
  console.log("Current schema:", res.rows);
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='admin'");
  console.log('Admin Tables:', tables.rows);
  const tables2 = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log('Public Tables:', tables2.rows);
  process.exit(0);
}
run();
