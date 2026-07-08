require('ts-node').register();
const { query, connectDB } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function run() {
  await connectDB();
  try {
    const res = await query("SELECT id, email, password, role FROM public.users LIMIT 5");
    console.log("Users:");
    for (const u of res.rows) {
      const match1 = await bcrypt.compare('Admin1234!', u.password);
      const match2 = await bcrypt.compare('admin123', u.password);
      const match3 = await bcrypt.compare('password123', u.password);
      console.log({ email: u.email, role: u.role, 'Admin1234!': match1, 'admin123': match2, 'password123': match3 });
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
