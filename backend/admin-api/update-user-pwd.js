require('ts-node').register();
const { query, connectDB } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function run() {
  await connectDB();
  try {
    const newHash = await bcrypt.hash('sadigli2024!', 10);
    const res = await query("UPDATE public.users SET password = $1 WHERE email = 'sadiqli2024@gmail.com'", [newHash]);
    console.log("Password updated successfully in Neon DB!");
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
