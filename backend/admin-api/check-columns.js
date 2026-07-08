require('ts-node').register();
const { query, connectDB } = require('./src/config/database');

async function run() {
  await connectDB();
  try {
    const res = await query("SELECT column_name, table_schema FROM information_schema.columns WHERE table_name = 'stores'");
    console.log("Stores columns:", res.rows);
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
