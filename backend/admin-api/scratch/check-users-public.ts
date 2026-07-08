import { connectDB, query } from '../src/config/database';

async function test() {
  await connectDB();
  try {
    const userRes = await query(`SELECT id, name, email, role, store_id FROM "public".users`);
    console.log('Public Users:');
    userRes.rows.forEach(u => console.log(u));
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}
test();
