require('ts-node').register();
const { query } = require('./src/config/database');

async function run() {
  try {
    const res = await query("SELECT tableowner FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stores'");
    console.log("Owner:", res.rows);
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
