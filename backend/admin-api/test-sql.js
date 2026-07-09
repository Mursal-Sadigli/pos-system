const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_QYHt1wIKWRb4@ep-sweet-feather-asrfznv1-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
const schemaQualified = 'public';
async function test() {
  try {
    const loginHistoryRes = await pool.query(`
      SELECT 
        lh.id, 
        'Giriş Cəhdi' as event,
        COALESCE(u.first_name || ' ' || u.last_name, u.email, 'Bilinmir') as user_name,
        lh.ip_address as ip,
        lh.user_agent as device,
        lh.is_successful,
        lh.failure_reason as details,
        TO_CHAR(lh.login_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'YYYY-MM-DD HH24:MI:SS') as timestamp,
        lh.login_time as sort_time
      FROM public.login_history lh
      LEFT JOIN ${schemaQualified}.users u ON lh.user_id = u.id
      ORDER BY lh.login_time DESC LIMIT 200
    `);
    console.log('Login History ok');

    const auditRes = await pool.query(`
      SELECT 
        al.id,
        al.action as event,
        COALESCE(u.first_name || ' ' || u.last_name, u.email, 'Bilinmir') as user_name,
        al.ip_address as ip,
        al.user_agent as device,
        true as is_successful,
        al.description as details,
        TO_CHAR(al.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'YYYY-MM-DD HH24:MI:SS') as timestamp,
        al.created_at as sort_time
      FROM ${schemaQualified}.audit_logs al
      LEFT JOIN ${schemaQualified}.users u ON al.user_id = u.id
      WHERE al.action IN ('ACCOUNT_LOCKED', 'CHANGE_PASSWORD', 'RESET_PASSWORD', 'ENABLE_2FA', 'DISABLE_2FA')
      ORDER BY al.created_at DESC LIMIT 200
    `);
    console.log('Audit ok');
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit();
}
test();
