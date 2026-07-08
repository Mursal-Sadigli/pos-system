import { connectDB, query, schemaQualified } from '../src/config/database';

async function test() {
  await connectDB();
  try {
    // Check which tables exist
    const tablesRes = await query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Tables in public schema:', tablesRes.rows.map(r => r.table_name));

    // Also check schemaQualified schema
    console.log('schemaQualified is:', schemaQualified);

    // Check if orders table exists
    const ordersCheck = await query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name IN ('orders', 'pos_orders', 'order_items', 'pos_order_items', 'products', 'categories')
    `);
    console.log('Relevant tables:', ordersCheck.rows.map(r => r.table_name));
    
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}
test();
