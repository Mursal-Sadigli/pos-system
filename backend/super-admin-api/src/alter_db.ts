import * as dotenv from 'dotenv';
dotenv.config();

import { query, schemaQualified } from './config/database';

async function alterDb() {
  try {
    console.log('Adding cost_price to products...');
    await query(`ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0;`);
    console.log('Done.');

    console.log('Adding cost_price to pos_order_items...');
    await query(`ALTER TABLE "public"."pos_order_items" ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0;`);
    console.log('Done.');

    // Update existing products to have cost_price = price * 0.7 for realistic data
    console.log('Updating existing products cost_price...');
    await query(`UPDATE "public"."products" SET cost_price = price * 0.7 WHERE cost_price = 0;`);
    console.log('Done.');
    
    // Update existing order items to have cost_price = price * 0.7
    console.log('Updating existing pos_order_items cost_price...');
    await query(`UPDATE "public"."pos_order_items" SET cost_price = price * 0.7 WHERE cost_price = 0;`);
    console.log('Done.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

alterDb();
