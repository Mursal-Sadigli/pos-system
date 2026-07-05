const { query } = require('./src/config/database');

async function check() {
  try {
    const res = await query("SELECT email, role, store_id FROM public.users WHERE role = 'ADMIN' ORDER BY created_at DESC LIMIT 3");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
