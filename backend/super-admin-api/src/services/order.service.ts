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
  items: OrderItem[];
}

export const createOrder = async (orderData: OrderData) => {
  return await transaction(async (client) => {
    // 1. Insert into public.orders
    const orderNumber = `ORD-${Date.now()}`;
    const orderQuery = `
      INSERT INTO "public"."orders" (
        order_number, customer_name, amount, status, payment, cashier
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const orderValues = [
      orderNumber,
      orderData.customer_name || 'Gündəlik Müştəri',
      orderData.amount,
      orderData.status || 'completed',
      orderData.payment || 'Nağd',
      orderData.cashier || 'Kassa'
    ];
    
    const orderResult = await client.query(orderQuery, orderValues);
    const newOrder = orderResult.rows[0];

    // 2. Insert order items and update stock
    for (const item of orderData.items) {
      // Insert item
      await client.query(`
        INSERT INTO "public"."order_items" (order_id, product_id, name, qty, price)
        VALUES ($1, $2, $3, $4, $5)
      `, [newOrder.id, item.product_id, item.name, item.qty, item.price]);

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
      SELECT * FROM "public"."order_items" WHERE order_id = $1
    `, [newOrder.id]);
    
    newOrder.items = itemsResult.rows;
    return newOrder;
  });
};

export const getOrders = async () => {
  const result = await query(`
    SELECT * FROM "public"."orders" 
    ORDER BY created_at DESC
  `);
  
  const orders = result.rows;
  
  // Fetch items for each order
  for (let order of orders) {
    const itemsResult = await query(`
      SELECT * FROM "public"."order_items" WHERE order_id = $1
    `, [order.id]);
    order.items = itemsResult.rows;
  }
  
  return orders;
};
