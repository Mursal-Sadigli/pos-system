const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_QYHt1wIKWRb4@ep-sweet-feather-asrfznv1-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
client.connect().then(() => {
  return Promise.all([
    client.query("SELECT * FROM public.security_settings").catch(e => e.message),
    client.query("SELECT * FROM super_admin.security_settings").catch(e => e.message)
  ]);
}).then(([pub, sa]) => {
  console.log("public.security_settings:", pub.rows || pub);
  console.log("super_admin.security_settings:", sa.rows || sa);
  client.end();
}).catch(console.error);
