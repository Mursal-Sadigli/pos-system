import { connectDB, query, schemaQualified } from './src/config/database';

async function test() {
  await connectDB();
  try {
    const res = await query(`
      SELECT * FROM information_schema.columns 
      WHERE table_name = 'support_tickets'
    `);
    console.log('support_tickets columns:', res.rows.map(r => r.column_name));
    
    // Check if any user has store_id
    const userRes = await query(`SELECT id, store_id FROM ${schemaQualified}.users LIMIT 1`);
    const storeRes = await query(`SELECT id FROM ${schemaQualified}.stores LIMIT 1`);
    
    if (userRes.rows.length > 0 && storeRes.rows.length > 0) {
      const u = userRes.rows[0];
      const s = storeRes.rows[0];
      console.log('Testing insert with user:', u.id, 'store:', s.id);
      
      try {
        const insertRes = await query(
          `INSERT INTO ${schemaQualified}.support_tickets (store_id, user_id, subject, message, status)
           VALUES ($1, $2, $3, $4, 'open')
           RETURNING id, subject, status, to_char(created_at, 'DD/MM/YYYY HH24:MI') as created_at`,
          [s.id, u.id, 'Test Subj', 'Test Msg']
        );
        console.log('Insert successful!', insertRes.rows[0]);
      } catch (err: any) {
        console.error('Insert failed:', err.message);
      }
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}
test();
