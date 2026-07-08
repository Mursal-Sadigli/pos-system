require('ts-node').register();
const { query, connectDB } = require('./src/config/database');

async function run() {
  await connectDB();
  try {
    await query(`ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS role_permissions JSONB DEFAULT '{"MANAGER": ["sales_view", "inventory_manage", "store_settings"], "CASHIER": ["pos_access", "sales_view_own"], "VIEWER": ["sales_view", "inventory_view"]}'::jsonb`);
    console.log("Success on public.stores!");
  } catch (e) {
    console.log("Error on public.stores:", e.message);
  }
  process.exit(0);
}
run();
