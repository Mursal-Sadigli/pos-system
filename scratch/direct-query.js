const { Pool } = require('pg');

async function test() {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_1sFq5hymIedO@ep-black-star-a2s1d6d3-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    const res = await pool.query(`
      SELECT * FROM information_schema.columns 
      WHERE table_schema = 'pos_system'
      AND table_name = 'support_tickets'
    `);
    console.log('support_tickets columns:', res.rows.map(r => r.column_name));
    
    // Check if table exists at all in public
    const resPub = await pool.query(`
      SELECT * FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'support_tickets'
    `);
    console.log('public.support_tickets columns:', resPub.rows.map(r => r.column_name));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}
test();
