const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://user:password@localhost:5432/pos_db' }); 
client.connect().then(async () => { 
  try {
    await client.query(`ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS role_permissions JSONB DEFAULT '{"MANAGER": ["sales_view", "inventory_manage", "store_settings"], "CASHIER": ["pos_access", "sales_view_own"], "VIEWER": ["sales_view", "inventory_view"]}'::jsonb`); 
    console.log("Added to public.stores"); 
  } catch (e) {
    console.error("Public schema error:", e.message);
  }
  try {
    await client.query(`ALTER TABLE admin.stores ADD COLUMN IF NOT EXISTS role_permissions JSONB DEFAULT '{"MANAGER": ["sales_view", "inventory_manage", "store_settings"], "CASHIER": ["pos_access", "sales_view_own"], "VIEWER": ["sales_view", "inventory_view"]}'::jsonb`);
    console.log("Added to admin.stores");
  } catch (e) {
    console.log("Admin schema error:", e.message);
  }
  console.log("Done"); 
  process.exit(0); 
});
