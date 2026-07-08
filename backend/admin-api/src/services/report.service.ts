import { query, schemaQualified } from '../config/database';

export class ReportService {
  /**
   * Satış, mənfəət, sifariş sayları və qrafik məlumatlarının xülasəsi
   */
  static async getSalesSummary(options: { startDate?: string; endDate?: string; storeId?: string }) {
    const { startDate, endDate, storeId } = options;
    const params: any[] = [];
    let queryIndex = 1;

    let storeFilter = '';
    if (storeId) {
      storeFilter = `AND o.store_id = $${queryIndex}`;
      params.push(storeId);
      queryIndex++;
    }

    let dateFilter = '';
    if (startDate) {
      dateFilter += ` AND o.created_at >= $${queryIndex}`;
      params.push(startDate);
      queryIndex++;
    }
    if (endDate) {
      // endDate-i həmin günün sonuna qədər əhatə etmək üçün
      dateFilter += ` AND o.created_at <= $${queryIndex}::timestamp + interval '1 day'`;
      params.push(endDate);
      queryIndex++;
    }

    // 1. Ümumi Statistika (Total Sales, Total Orders, Total Profit)
    // Mənfəət = Satış məbləği - Maya dəyəri (cost). 
    // cost order_items cədvəlində yoxdursa, products cədvəlindən cost çəkilir.
    const statsQuery = `
      SELECT 
        COALESCE(SUM(o.total), 0) as total_sales,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total - (
          SELECT SUM(oi.quantity * COALESCE(p.cost, 0))
          FROM ${schemaQualified}.order_items oi
          JOIN ${schemaQualified}.products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id
        )), 0) as total_profit
      FROM ${schemaQualified}.orders o
      WHERE o.order_status != 'CANCELLED' ${storeFilter} ${dateFilter}
    `;

    const statsResult = await query(statsQuery, params);
    const summary = statsResult.rows[0] || { total_sales: 0, total_orders: 0, total_profit: 0 };

    // 2. Qrafik Məlumatı (Daily Chart Data)
    const chartQuery = `
      SELECT 
        TO_CHAR(o.created_at, 'YYYY-MM-DD') as date,
        COALESCE(SUM(o.total), 0) as sales,
        COUNT(o.id) as orders,
        COALESCE(SUM(o.total - (
          SELECT SUM(oi.quantity * COALESCE(p.cost, 0))
          FROM ${schemaQualified}.order_items oi
          JOIN ${schemaQualified}.products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id
        )), 0) as profit
      FROM ${schemaQualified}.orders o
      WHERE o.order_status != 'CANCELLED' ${storeFilter} ${dateFilter}
      GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    const chartResult = await query(chartQuery, params);

    // 3. Günlük Kassir Hesabatı (Daily Cashier Summary)
    const cashierQuery = `
      SELECT 
        TO_CHAR(o.created_at, 'YYYY-MM-DD') as date,
        u.name as cashier,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total), 0) as total_sales
      FROM ${schemaQualified}.orders o
      JOIN ${schemaQualified}.users u ON o.cashier_id = u.id
      WHERE o.order_status != 'CANCELLED' ${storeFilter} ${dateFilter}
      GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD'), u.name
      ORDER BY date DESC, total_sales DESC
    `;

    const cashierResult = await query(cashierQuery, params);

    return {
      summary: {
        total_sales: Number(summary.total_sales),
        total_orders: Number(summary.total_orders),
        total_profit: Number(summary.total_profit),
        avg_order: Number(summary.total_orders) > 0 ? Number(summary.total_sales) / Number(summary.total_orders) : 0,
      },
      chartData: chartResult.rows.map(row => ({
        date: row.date,
        sales: Number(row.sales),
        orders: Number(row.orders),
        profit: Number(row.profit)
      })),
      dailyReports: cashierResult.rows.map(row => ({
        date: row.date,
        cashier: row.cashier,
        total_orders: Number(row.total_orders),
        total_sales: Number(row.total_sales)
      }))
    };
  }

  /**
   * Ən çox satılan məhsullar
   */
  static async getTopProducts(options: { startDate?: string; endDate?: string; storeId?: string; limit?: number }) {
    const { startDate, endDate, storeId, limit = 10 } = options;
    const params: any[] = [];
    let queryIndex = 1;

    let storeFilter = '';
    if (storeId) {
      storeFilter = `AND o.store_id = $${queryIndex}`;
      params.push(storeId);
      queryIndex++;
    }

    let dateFilter = '';
    if (startDate) {
      dateFilter += ` AND o.created_at >= $${queryIndex}`;
      params.push(startDate);
      queryIndex++;
    }
    if (endDate) {
      dateFilter += ` AND o.created_at <= $${queryIndex}::timestamp + interval '1 day'`;
      params.push(endDate);
      queryIndex++;
    }

    params.push(limit);
    const limitPlaceholder = `$${queryIndex}`;

    const topProductsQuery = `
      SELECT 
        oi.name,
        c.name as category,
        SUM(oi.quantity) as total_qty,
        SUM(oi.total) as total_revenue,
        SUM(oi.total - (oi.quantity * COALESCE(p.cost, 0))) as total_profit
      FROM ${schemaQualified}.order_items oi
      JOIN ${schemaQualified}.orders o ON oi.order_id = o.id
      JOIN ${schemaQualified}.products p ON oi.product_id = p.id
      LEFT JOIN ${schemaQualified}.categories c ON p.category_id = c.id
      WHERE o.order_status != 'CANCELLED' ${storeFilter} ${dateFilter}
      GROUP BY oi.name, c.name
      ORDER BY total_qty DESC
      LIMIT ${limitPlaceholder}
    `;

    const result = await query(topProductsQuery, params);
    return result.rows.map(row => ({
      name: row.name,
      category: row.category || 'Kateqoriyasız',
      total_qty: Number(row.total_qty),
      total_revenue: Number(row.total_revenue),
      total_profit: Number(row.total_profit),
      margin_pct: Number(row.total_revenue) > 0 ? (Number(row.total_profit) / Number(row.total_revenue)) * 100 : 0
    }));
  }

  /**
   * Kateqoriyalar üzrə satış hesabatı
   */
  static async getByCategory(options: { startDate?: string; endDate?: string; storeId?: string }) {
    const { startDate, endDate, storeId } = options;
    const params: any[] = [];
    let queryIndex = 1;

    let storeFilter = '';
    if (storeId) {
      storeFilter = `AND o.store_id = $${queryIndex}`;
      params.push(storeId);
      queryIndex++;
    }

    let dateFilter = '';
    if (startDate) {
      dateFilter += ` AND o.created_at >= $${queryIndex}`;
      params.push(startDate);
      queryIndex++;
    }
    if (endDate) {
      dateFilter += ` AND o.created_at <= $${queryIndex}::timestamp + interval '1 day'`;
      params.push(endDate);
      queryIndex++;
    }

    const categoryQuery = `
      SELECT 
        COALESCE(c.name, 'Kateqoriyasız') as category,
        SUM(oi.total) as total_sales,
        COUNT(DISTINCT o.id) as total_orders
      FROM ${schemaQualified}.order_items oi
      JOIN ${schemaQualified}.orders o ON oi.order_id = o.id
      JOIN ${schemaQualified}.products p ON oi.product_id = p.id
      LEFT JOIN ${schemaQualified}.categories c ON p.category_id = c.id
      WHERE o.order_status != 'CANCELLED' ${storeFilter} ${dateFilter}
      GROUP BY c.name
      ORDER BY total_sales DESC
    `;

    const result = await query(categoryQuery, params);
    
    // Ümumi cəmi hesablamaq (faiz nisbətləri üçün)
    const totalSales = result.rows.reduce((sum, row) => sum + Number(row.total_sales), 0);

    return result.rows.map(row => ({
      category: row.category,
      total_sales: Number(row.total_sales),
      total_orders: Number(row.total_orders),
      percentage: totalSales > 0 ? (Number(row.total_sales) / totalSales) * 100 : 0
    }));
  }

  /**
   * İnventar/Stok Hesabatı
   */
  static async getInventoryReport(storeId: string) {
    const params = [storeId];

    // 1. Az qalan məhsullar (stok <= min_stock və is_active = true)
    const lowStockQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock, p.min_stock,
        COALESCE(c.name, 'Kateqoriyasız') as category,
        p.price, p.cost
      FROM ${schemaQualified}.products p
      LEFT JOIN ${schemaQualified}.categories c ON p.category_id = c.id
      WHERE p.store_id = $1 AND p.is_active = true AND p.stock <= p.min_stock AND p.stock > 0
      ORDER BY p.stock ASC
    `;
    const lowStockRes = await query(lowStockQuery, params);

    // 2. Bitmiş məhsullar (stok = 0)
    const outOfStockQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock,
        COALESCE(c.name, 'Kateqoriyasız') as category,
        p.price, p.cost
      FROM ${schemaQualified}.products p
      LEFT JOIN ${schemaQualified}.categories c ON p.category_id = c.id
      WHERE p.store_id = $1 AND p.is_active = true AND p.stock = 0
      ORDER BY p.name ASC
    `;
    const outOfStockRes = await query(outOfStockQuery, params);

    // 3. Ümumi stok dəyəri (cost-a görə və satılan qiymətə görə)
    const valueQuery = `
      SELECT 
        COUNT(id) as total_products,
        SUM(stock) as total_items,
        SUM(stock * COALESCE(cost, 0)) as total_cost_value,
        SUM(stock * price) as total_retail_value
      FROM ${schemaQualified}.products p
      WHERE store_id = $1 AND is_active = true
    `;
    const valueRes = await query(valueQuery, params);
    const valueStats = valueRes.rows[0] || { total_products: 0, total_items: 0, total_cost_value: 0, total_retail_value: 0 };

    // 4. Kateqoriya üzrə stok
    const byCategoryQuery = `
      SELECT 
        COALESCE(c.name, 'Kateqoriyasız') as category,
        COUNT(p.id) as product_count,
        SUM(p.stock) as total_stock,
        SUM(p.stock * COALESCE(p.cost, 0)) as total_cost_value
      FROM ${schemaQualified}.products p
      LEFT JOIN ${schemaQualified}.categories c ON p.category_id = c.id
      WHERE p.store_id = $1 AND p.is_active = true
      GROUP BY c.name
      ORDER BY total_stock DESC
    `;
    const byCategoryRes = await query(byCategoryQuery, params);

    return {
      lowStock: lowStockRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        stock: Number(row.stock),
        min_stock: Number(row.min_stock),
        category: row.category,
        price: Number(row.price),
        cost: Number(row.cost)
      })),
      outOfStock: outOfStockRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        stock: Number(row.stock),
        category: row.category,
        price: Number(row.price),
        cost: Number(row.cost)
      })),
      summary: {
        total_products: Number(valueStats.total_products),
        total_items: Number(valueStats.total_items),
        total_cost_value: Number(valueStats.total_cost_value),
        total_retail_value: Number(valueStats.total_retail_value),
      },
      byCategory: byCategoryRes.rows.map(row => ({
        category: row.category,
        product_count: Number(row.product_count),
        total_stock: Number(row.total_stock),
        total_cost_value: Number(row.total_cost_value)
      }))
    };
  }
}
