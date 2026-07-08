import { connectDB, query, schemaQualified } from '../backend/admin-api/src/config/database';

async function test() {
  await connectDB();
  try {
    const res = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = '${schemaQualified.replace(/"/g, '')}' 
        AND table_name = 'support_tickets'
      );
    `);
    console.log('Support tickets table exists:', res.rows[0].exists);

    // Try an insert with dummy values to see the exact error
    try {
        await query(`INSERT INTO ${schemaQualified}.support_tickets (store_id, user_id, subject, message, status) VALUES (null, null, 'Test', 'Test', 'open')`);
    } catch (err: any) {
        console.error('Insert error:', err.message);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
test();
