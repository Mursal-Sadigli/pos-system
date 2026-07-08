require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sql = `
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_user_id ON notification_preferences(user_id);
`;

async function run() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ notification_preferences cədvəli yaradıldı (və ya artıq mövcuddur)');
  } catch (err) {
    console.error('❌ Migration xətası:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

run();
