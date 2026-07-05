const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: 'C:/Users/fullm/.gemini/antigravity/worktrees/pos/fix-missing-typescript-types/backend/super-admin-api/.env' });

async function check() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    const res = await pool.query("SELECT * FROM public.users WHERE email = 'sadiqli2024@gmail.com'");
    if (res.rows.length === 0) {
      console.log('User not found');
      return;
    }
    const user = res.rows[0];
    console.log('User found:', user.email);
    console.log('Password hash:', user.password);
    
    const isMatch = await bcrypt.compare('sadigli2024!', user.password);
    console.log('Does sadigli2024! match?', isMatch);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
