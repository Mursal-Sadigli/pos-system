const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://user:password@localhost:5432/pos_db' });

async function init() {
  await client.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS "admin"."pos_orders" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number VARCHAR(100) UNIQUE,
      customer_name VARCHAR(255) DEFAULT 'Gündəlik Müştəri',
      amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      status VARCHAR(50) DEFAULT 'completed',
      payment VARCHAR(50) DEFAULT 'Nağd',
      cashier VARCHAR(100) DEFAULT 'Kassa',
      source VARCHAR(50) DEFAULT 'POS',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS "admin"."pos_order_items" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES "admin"."pos_orders"(id) ON DELETE CASCADE,
      product_id UUID,
      name VARCHAR(255) NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0,
      cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`ALTER TABLE "admin"."pos_order_items" ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0`);
  await client.query(`ALTER TABLE "admin"."pos_orders" ADD COLUMN IF NOT EXISTS store_id UUID`);

  await client.query(`UPDATE "admin"."pos_order_items" SET cost_price = price * 0.7 WHERE cost_price = 0 OR cost_price IS NULL`);

  await client.query(`CREATE INDEX IF NOT EXISTS "idx_pos_orders_status" ON "admin"."pos_orders"(status)`);
  await client.query(`ALTER TABLE "admin"."pos_orders" ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'POS'`);
  await client.query(`CREATE INDEX IF NOT EXISTS "idx_pos_order_items_order_id" ON "admin"."pos_order_items"(order_id)`);

  console.log("Tables created successfully");
  await client.end();
}

init().catch(err => {
  console.error("Error creating tables:", err);
  process.exit(1);
});
