require('ts-node').register();
const { query, connectDB } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function run() {
  await connectDB();
  const email = 'fullmursel2025@gmail.com';
  const plainPassword = '12345abc';
  const role = 'ADMIN';
  
  try {
    const checkRes = await query("SELECT id FROM public.users WHERE email = $1", [email]);
    const hash = await bcrypt.hash(plainPassword, 10);
    
    if (checkRes.rows.length > 0) {
      // Update existing
      await query("UPDATE public.users SET password = $1, role = $2, is_active = true WHERE email = $3", [hash, role, email]);
      console.log(`User ${email} updated successfully as ${role}!`);
    } else {
      // Create new
      // We need a store_id. Let's find first store.
      const storeRes = await query("SELECT id FROM public.stores LIMIT 1");
      const storeId = storeRes.rows.length > 0 ? storeRes.rows[0].id : null;
      
      await query(
        `INSERT INTO public.users (name, email, password, role, store_id, is_active, is_verified, must_change_password) 
         VALUES ($1, $2, $3, $4, $5, true, true, false)`,
        ['Mursel Admin', email, hash, role, storeId]
      );
      console.log(`User ${email} created successfully as ${role}!`);
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
