require('ts-node').register();
const { query, connectDB } = require('./src/config/database');

async function run() {
  await connectDB();
  try {
    const res = await query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name IN ('users', 'stores')");
    console.log("Tables:", res.rows);
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
