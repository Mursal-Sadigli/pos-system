import { query, transaction, schemaQualified } from '../config/database';

export interface OrderItem {
  product_id: string;
  name: string;
  qty: number;
  price: number;
}

export interface OrderData {
  customer_name?: string;
  amount: number;
  status?: string;
  payment?: string;
  cashier?: string;
  source?: string;
  store_id?: string;
  items: OrderItem[];
}

export const createOrder = async (orderData: OrderData) => {
  return await transaction(async (client) => {
    // 1. Insert into public.pos_orders
    const orderNumber = `ORD-${Date.now()}`;
    const orderQuery = `
      INSERT INTO "public"."pos_orders" (
        order_number, customer_name, amount, status, payment, cashier, source, store_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const orderValues = [
      orderNumber,
      orderData.customer_name || 'Gündəlik Müştəri',
      orderData.amount,
      orderData.status || 'completed',
      orderData.payment || 'Nağd',
      orderData.cashier || 'Kassa',
      orderData.source || 'POS',
      orderData.store_id || null
    ];
    
    const orderResult = await client.query(orderQuery, orderValues);
    const newOrder = orderResult.rows[0];

    // 2. Insert order items and update stock
    for (const item of orderData.items) {
      // First fetch the product to get its cost_price
      let costPrice = item.price * 0.7; // default fallback
      if (item.product_id) {
        const productResult = await client.query(
          `SELECT cost_price FROM ${schemaQualified}."products" WHERE id = $1`,
          [item.product_id]
        );
        if (productResult.rows.length > 0 && productResult.rows[0].cost_price != null) {
          costPrice = productResult.rows[0].cost_price;
        }
      }

      // Insert item
      await client.query(`
        INSERT INTO "public"."pos_order_items" (order_id, product_id, name, qty, price, cost_price)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [newOrder.id, item.product_id, item.name, item.qty, item.price, costPrice]);

      // Update product stock (in super_admin schema as specified by schemaQualified)
      if (item.product_id) {
        await client.query(`
          UPDATE ${schemaQualified}."products"
          SET stock = stock - $1
          WHERE id = $2 AND stock >= $1
        `, [item.qty, item.product_id]);
      }
    }

    // 3. Fetch full order with items
    const itemsResult = await client.query(`
      SELECT * FROM "public"."pos_order_items" WHERE order_id = $1
    `, [newOrder.id]);
    
    newOrder.items = itemsResult.rows;
    return newOrder;
  });
};

export const getOrders = async (storeId?: string) => {
  let queryText = `SELECT * FROM "public"."pos_orders"`;
  const params: any[] = [];
  
  if (storeId) {
    queryText += ` WHERE store_id = $1`;
    params.push(storeId);
  }
  
  queryText += ` ORDER BY created_at DESC`;

  const result = await query(queryText, params);
  const orders = result.rows;
  
  // Fetch items for each order
  for (let order of orders) {
    const itemsResult = await query(`
      SELECT * FROM "public"."pos_order_items" WHERE order_id = $1
    `, [order.id]);
    order.items = itemsResult.rows;
  }
  
  return orders;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const result = await query(`
    UPDATE "public"."pos_orders"
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `, [status, id]);
  return result.rows[0];
};

export const deleteOrder = async (id: string) => {
  return await transaction(async (client) => {
    // Return items to stock first
    const itemsResult = await client.query(`
      SELECT * FROM "public"."pos_order_items" WHERE order_id = $1
    `, [id]);
    
    for (const item of itemsResult.rows) {
      if (item.product_id) {
        await client.query(`
          UPDATE ${schemaQualified}."products"
          SET stock = stock + $1
          WHERE id = $2
        `, [item.qty, item.product_id]);
      }
    }

    // Delete items
    await client.query(`DELETE FROM "public"."pos_order_items" WHERE order_id = $1`, [id]);
    
    // Delete order
    const result = await client.query(`DELETE FROM "public"."pos_orders" WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  });
};
