require('ts-node').register();
const { query, connectDB } = require('./src/config/database');

async function run() {
  await connectDB();
  const res = await query("SELECT id, name FROM public.stores");
  console.log("Stores in Neon public:", res.rows);
  process.exit(0);
}
run();
