const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_QYHt1wIKWRb4@ep-sweet-feather-asrfznv1-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require' });

async function checkAndAddColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    const cols = res.rows.map(r => r.column_name);
    
    if (!cols.includes('failed_login_attempts')) {
      await pool.query('ALTER TABLE public.users ADD COLUMN failed_login_attempts INT DEFAULT 0');
      console.log('Added failed_login_attempts');
    }
    if (!cols.includes('locked_until')) {
      await pool.query('ALTER TABLE public.users ADD COLUMN locked_until TIMESTAMP WITHOUT TIME ZONE');
      console.log('Added locked_until');
    }
    console.log('Database columns ready.');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
checkAndAddColumns();
