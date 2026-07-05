const { query } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function check() {
  try {
    const res = await query("SELECT * FROM public.users WHERE email = 'sadiqli2024@gmail.com'");
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
    process.exit();
  }
}

check();
