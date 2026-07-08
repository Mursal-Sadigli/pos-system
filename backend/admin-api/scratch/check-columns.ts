import { connectDB, query, schemaQualified } from '../src/config/database';

async function test() {
  await connectDB();
  try {
    // Check orders columns
    const ordersCol = await query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'orders'
      ORDER BY ordinal_position
    `);
    console.log('orders columns:', ordersCol.rows.map(r => `${r.column_name}(${r.data_type})`));

    const posOrdersCol = await query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'pos_orders'
      ORDER BY ordinal_position
    `);
    console.log('pos_orders columns:', posOrdersCol.rows.map(r => `${r.column_name}(${r.data_type})`));

    const orderItemsCol = await query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'order_items'
      ORDER BY ordinal_position
    `);
    console.log('order_items columns:', orderItemsCol.rows.map(r => `${r.column_name}(${r.data_type})`));

    const posOrderItemsCol = await query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'pos_order_items'
      ORDER BY ordinal_position
    `);
    console.log('pos_order_items columns:', posOrderItemsCol.rows.map(r => `${r.column_name}(${r.data_type})`));
    
    const productsCol = await query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'products'
      ORDER BY ordinal_position
    `);
    console.log('products columns:', productsCol.rows.map(r => `${r.column_name}(${r.data_type})`));
    
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}
test();
