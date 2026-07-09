const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_QYHt1wIKWRb4@ep-sweet-feather-asrfznv1-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require' 
});

const query = `
  CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    meta JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
  CREATE INDEX IF NOT EXISTS idx_system_logs_source ON public.system_logs(source);
  CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at);
`;

pool.query(query).then(res => {
  console.log('system_logs table created successfully!');
  pool.end();
}).catch(err => {
  console.error('Error creating table:', err);
  pool.end();
});
