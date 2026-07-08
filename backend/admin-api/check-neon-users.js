require('ts-node').register();
const { query, connectDB } = require('./src/config/database');

async function run() {
  await connectDB();
  try {
    const res = await query("SELECT id, email, role FROM public.users ORDER BY created_at");
    console.log("Users in Neon DB (public.users):", res.rows);
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
