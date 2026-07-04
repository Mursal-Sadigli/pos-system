const { Pool } = require('pg');
require('dotenv').config();
const { InvitationService } = require('./dist/services/invitation.service');

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query("SELECT id, email, token, status FROM super_admin.invitations WHERE status = 'PENDING' ORDER BY created_at DESC LIMIT 1");
    console.log('inviteRow', JSON.stringify(res.rows[0], null, 2));
    if (!res.rows[0]) return;

    try {
      const result = await InvitationService.acceptInvitation(res.rows[0].token);
      console.log('acceptResult', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('acceptError', err.message || err);
      if (err && err.stack) console.error(err.stack);
    }
  } catch (err) {
    console.error('queryError', err);
  } finally {
    await pool.end();
  }
})();
