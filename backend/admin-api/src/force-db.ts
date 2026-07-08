import { connectDB, query } from './config/database';

async function forceInit() {
  try {
    console.log('Connecting to DB and forcing initialization...');
    await connectDB();
    
    console.log('Checking if tables exist...');
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in public schema:');
    console.dir(result.rows.map((r: any) => r.table_name));

  } catch (error) {
    console.error('Error during DB init:', error);
  } finally {
    process.exit(0);
  }
}

forceInit();
