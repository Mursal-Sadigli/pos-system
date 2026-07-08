require('ts-node').register();
const { query, connectDB } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function run() {
  await connectDB();
  try {
    const res = await query("SELECT password FROM public.users WHERE email = 'sadiqli2024@gmail.com'");
    if (res.rows.length > 0) {
      const hash = res.rows[0].password;
      const match = await bcrypt.compare('sadigli2024!', hash);
      console.log("Does sadigli2024! match?", match);
    } else {
      console.log("User not found");
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
