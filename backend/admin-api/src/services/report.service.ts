import { query, schemaQualified } from '../config/database';

export class ReportService {
  /**
   * Satış, mənfəət, sifariş sayları və qrafik məlumatlarının xülasəsi
   * pos_orders + pos_order_items cədvəllərindən götürülür
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
      dateFilter += ` AND o.created_at < ($${queryIndex}::date + interval '1 day')`;
      params.push(endDate);
      queryIndex++;
    }

    const statusFilter = `AND o.status != 'cancelled'`;

    // 1. Ümumi Statistika
    const statsQuery = `
      SELECT 
        COALESCE(SUM(o.amount), 0) as total_sales,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.amount - COALESCE((
          SELECT SUM(oi.qty * COALESCE(oi.cost_price, 0))
          FROM "${schemaQualified.replace(/"/g, '')}".pos_order_items oi
          WHERE oi.order_id = o.id
        ), 0)), 0) as total_profit
      FROM "${schemaQualified.replace(/"/g, '')}".pos_orders o
      WHERE 1=1 ${statusFilter} ${storeFilter} ${dateFilter}
    `;

    const statsResult = await query(statsQuery, params);
    const summary = statsResult.rows[0] || { total_sales: 0, total_orders: 0, total_profit: 0 };

    // 2. Qrafik Məlumatı (Daily Chart Data)
    const chartQuery = `
      SELECT 
        TO_CHAR(o.created_at, 'YYYY-MM-DD') as date,
        COALESCE(SUM(o.amount), 0) as sales,
        COUNT(o.id) as orders,
        COALESCE(SUM(o.amount - COALESCE((
          SELECT SUM(oi.qty * COALESCE(oi.cost_price, 0))
          FROM "${schemaQualified.replace(/"/g, '')}".pos_order_items oi
          WHERE oi.order_id = o.id
        ), 0)), 0) as profit
      FROM "${schemaQualified.replace(/"/g, '')}".pos_orders o
      WHERE 1=1 ${statusFilter} ${storeFilter} ${dateFilter}
      GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    const chartResult = await query(chartQuery, params);

    // 3. Kassir üzrə hesabat (cashier sütunu mətn formatındadır)
    const cashierQuery = `
      SELECT 
        TO_CHAR(o.created_at, 'YYYY-MM-DD') as date,
        COALESCE(o.cashier, 'Naməlum') as cashier,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.amount), 0) as total_sales
      FROM "${schemaQualified.replace(/"/g, '')}".pos_orders o
      WHERE 1=1 ${statusFilter} ${storeFilter} ${dateFilter}
      GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD'), o.cashier
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
      dateFilter += ` AND o.created_at < ($${queryIndex}::date + interval '1 day')`;
      params.push(endDate);
      queryIndex++;
    }

    params.push(limit);
    const limitPlaceholder = `$${queryIndex}`;

    const topProductsQuery = `
      SELECT 
        oi.name,
        SUM(oi.qty) as total_qty,
        SUM(oi.qty * oi.price) as total_revenue,
        SUM(oi.qty * oi.price - oi.qty * COALESCE(oi.cost_price, 0)) as total_profit
      FROM "${schemaQualified.replace(/"/g, '')}".pos_order_items oi
      JOIN "${schemaQualified.replace(/"/g, '')}".pos_orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled' ${storeFilter} ${dateFilter}
      GROUP BY oi.name
      ORDER BY total_qty DESC
      LIMIT ${limitPlaceholder}
    `;

    const result = await query(topProductsQuery, params);
    return result.rows.map(row => ({
      name: row.name,
      category: 'Ümumi',
      total_qty: Number(row.total_qty),
      total_revenue: Number(row.total_revenue),
      total_profit: Number(row.total_profit),
      margin_pct: Number(row.total_revenue) > 0 ? (Number(row.total_profit) / Number(row.total_revenue)) * 100 : 0
    }));
  }

  /**
   * Ödəniş növü üzrə satış hesabatı (kateqoriya yoxdur, payment ilə əvəzlənir)
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
      dateFilter += ` AND o.created_at < ($${queryIndex}::date + interval '1 day')`;
      params.push(endDate);
      queryIndex++;
    }

    const categoryQuery = `
      SELECT 
        COALESCE(o.payment, 'Digər') as category,
        SUM(o.amount) as total_sales,
        COUNT(o.id) as total_orders
      FROM "${schemaQualified.replace(/"/g, '')}".pos_orders o
      WHERE o.status != 'cancelled' ${storeFilter} ${dateFilter}
      GROUP BY o.payment
      ORDER BY total_sales DESC
    `;

    const result = await query(categoryQuery, params);
    
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
    // products cədvəlindən stok məlumatları
    const lowStockQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock, p.min_stock,
        p.price, COALESCE(p.cost, p.cost_price, 0) as cost
      FROM "${schemaQualified.replace(/"/g, '')}".products p
      WHERE p.stock <= p.min_stock AND p.stock > 0
      ORDER BY p.stock ASC
    `;
    const lowStockRes = await query(lowStockQuery);

    const outOfStockQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock,
        p.price, COALESCE(p.cost, p.cost_price, 0) as cost
      FROM "${schemaQualified.replace(/"/g, '')}".products p
      WHERE p.stock = 0
      ORDER BY p.name ASC
    `;
    const outOfStockRes = await query(outOfStockQuery);

    const valueQuery = `
      SELECT 
        COUNT(id) as total_products,
        COALESCE(SUM(stock), 0) as total_items,
        COALESCE(SUM(stock * COALESCE(cost, cost_price, 0)), 0) as total_cost_value,
        COALESCE(SUM(stock * price), 0) as total_retail_value
      FROM "${schemaQualified.replace(/"/g, '')}".products
    `;
    const valueRes = await query(valueQuery);
    const valueStats = valueRes.rows[0] || { total_products: 0, total_items: 0, total_cost_value: 0, total_retail_value: 0 };

    return {
      lowStock: lowStockRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        stock: Number(row.stock),
        min_stock: Number(row.min_stock),
        category: 'Ümumi',
        price: Number(row.price),
        cost: Number(row.cost)
      })),
      outOfStock: outOfStockRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        stock: Number(row.stock),
        category: 'Ümumi',
        price: Number(row.price),
        cost: Number(row.cost)
      })),
      summary: {
        total_products: Number(valueStats.total_products),
        total_items: Number(valueStats.total_items),
        total_cost_value: Number(valueStats.total_cost_value),
        total_retail_value: Number(valueStats.total_retail_value),
      },
      byCategory: []
    };
  }

  /**
   * Sistem üzrə ümumi xülasə (Bütün mağazalar cəmi)
   */
  static async getSystemSummary() {
    // Toplam gəlir və sifarişlər
    const orderQuery = `
      SELECT 
        COALESCE(SUM(amount), 0) as total_sales,
        COUNT(id) as total_orders,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) as current_month_rev,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) as last_month_rev,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN id END) as current_month_orders,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < DATE_TRUNC('month', CURRENT_DATE) THEN id END) as last_month_orders
      FROM "${schemaQualified.replace(/"/g, '')}".pos_orders
      WHERE status != 'cancelled'
    `;
    const orderRes = await query(orderQuery);
    
    // Toplam istifadəçilər
    const userQuery = `SELECT COUNT(id) as total_users FROM "${schemaQualified.replace(/"/g, '')}".users`;
    const userRes = await query(userQuery);

    // Toplam mağazalar
    const storeQuery = `SELECT COUNT(id) as total_stores FROM "${schemaQualified.replace(/"/g, '')}".stores`;
    const storeRes = await query(storeQuery);

    const summary = orderRes.rows[0];
    const totalUsers = parseInt(userRes.rows[0].total_users, 10);
    const totalStores = parseInt(storeRes.rows[0].total_stores, 10);
    const totalSales = Number(summary.total_sales);
    const totalOrders = Number(summary.total_orders);

    const currRev = Number(summary.current_month_rev);
    const lastRev = Number(summary.last_month_rev);
    const salesGrowth = lastRev > 0 ? Math.round(((currRev - lastRev) / lastRev) * 100) : (currRev > 0 ? 100 : 0);

    const currOrd = Number(summary.current_month_orders);
    const lastOrd = Number(summary.last_month_orders);
    const ordersGrowth = lastOrd > 0 ? Math.round(((currOrd - lastOrd) / lastOrd) * 100) : (currOrd > 0 ? 100 : 0);

    return {
      total_sales: totalSales,
      total_orders: totalOrders,
      total_users: totalUsers,
      total_stores: totalStores,
      avg_order: totalOrders > 0 ? totalSales / totalOrders : 0,
      sales_growth: salesGrowth,
      orders_growth: ordersGrowth,
      stores_growth: 0, // Not typically tracked month-over-month for small scale
      users_growth: 0, 
      avg_order_growth: 0
    };
  }

  /**
   * Sistem üzrə trendlər (Aylıq qrafik üçün)
   */
  static async getSystemTrends(period: string = 'monthly') {
    // 6 aylıq qrafik (Sadələşdirilmiş olaraq)
    const trendQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as name,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(id) as orders
      FROM "${schemaQualified.replace(/"/g, '')}".pos_orders
      WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `;
    const trendRes = await query(trendQuery);

    // Bütün data
    return trendRes.rows.map(row => ({
      name: row.name,
      revenue: Number(row.revenue),
      orders: Number(row.orders),
      stores: 12 // Hardcoded store count for chart
    }));
  }

  /**
   * Ən çox gəlir gətirən mağazalar
   */
  static async getTopStores() {
    const topStoresQuery = `
      SELECT 
        s.name,
        COALESCE(SUM(o.amount), 0) as revenue,
        COUNT(o.id) as orders
      FROM "${schemaQualified.replace(/"/g, '')}".stores s
      LEFT JOIN "${schemaQualified.replace(/"/g, '')}".pos_orders o 
        ON s.id::text = o.store_id AND o.status != 'cancelled'
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
      LIMIT 10
    `;
    const result = await query(topStoresQuery);
    
    return result.rows.map(row => ({
      name: row.name,
      revenue: Number(row.revenue),
      orders: Number(row.orders),
      growth: Math.round((Math.random() * 20) - 5), // Mock growth
      color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
    }));
  }

  /**
   * İstifadəçi artımı
   */
  static async getUserGrowth() {
    const growthQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as name,
        COUNT(CASE WHEN role IN ('ADMIN', 'SUPER_ADMIN') THEN 1 END) as admins,
        COUNT(CASE WHEN role NOT IN ('ADMIN', 'SUPER_ADMIN') THEN 1 END) as users
      FROM "${schemaQualified.replace(/"/g, '')}".users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `;
    const result = await query(growthQuery);
    return result.rows.map(row => ({
      name: row.name,
      users: Number(row.users),
      admins: Number(row.admins)
    }));
  }

  /**
   * Mağaza hesabatları (Performance List)
   */
  static async getStorePerformanceList() {
    const queryStr = `
      SELECT 
        s.id,
        s.name,
        s.is_active as status,
        COALESCE(SUM(o.amount), 0) as revenue,
        COUNT(DISTINCT o.id) as orders,
        COUNT(DISTINCT p.id) as products,
        COALESCE(SUM(CASE WHEN o.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN o.amount ELSE 0 END), 0) as current_month_rev,
        COALESCE(SUM(CASE WHEN o.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AND o.created_at < DATE_TRUNC('month', CURRENT_DATE) THEN o.amount ELSE 0 END), 0) as last_month_rev
      FROM "${schemaQualified.replace(/"/g, '')}".stores s
      LEFT JOIN "${schemaQualified.replace(/"/g, '')}".pos_orders o 
        ON s.id = o.store_id AND o.status != 'cancelled'
      LEFT JOIN "${schemaQualified.replace(/"/g, '')}".products p 
        ON s.id = p.store_id
      GROUP BY s.id, s.name, s.is_active
      ORDER BY revenue DESC
    `;
    const result = await query(queryStr);
    
    // Assign random colors and mock growth for now, since we don't have historical comparison built into this query
    const colors = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6'];
    
    return result.rows.map((row, index) => {
      const curr = Number(row.current_month_rev);
      const last = Number(row.last_month_rev);
      const calculatedGrowth = last > 0 ? Math.round(((curr - last) / last) * 100) : (curr > 0 ? 100 : 0);

      return {
        id: row.id,
        name: row.name,
        status: row.status === true || row.status === 'true' || row.status === 't' ? 'active' : 'inactive',
        revenue: Number(row.revenue),
        orders: Number(row.orders),
        products: Number(row.products),
        customers: Number(row.orders), // Fallback
        growth: calculatedGrowth,
        color: colors[index % colors.length]
      };
    });
  }

  /**
   * Mağaza aylıq gəlir trendi (Multi-line chart)
   */
  static async getStoreTrendsChart() {
    const queryStr = `
      SELECT 
        s.name as store_name,
        TO_CHAR(DATE_TRUNC('month', o.created_at), 'Mon') as month_name,
        DATE_TRUNC('month', o.created_at) as month_date,
        COALESCE(SUM(o.amount), 0) as revenue
      FROM "${schemaQualified.replace(/"/g, '')}".stores s
      JOIN "${schemaQualified.replace(/"/g, '')}".pos_orders o 
        ON s.id = o.store_id AND o.status != 'cancelled'
      WHERE o.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY s.name, DATE_TRUNC('month', o.created_at), TO_CHAR(DATE_TRUNC('month', o.created_at), 'Mon')
      ORDER BY month_date ASC
    `;
    
    const result = await query(queryStr);
    
    // Transform data to [{ name: 'Jan', 'Store 1': 100, 'Store 2': 200 }, ...]
    const transformed: Record<string, any> = {};
    const monthsOrder: string[] = [];
    
    result.rows.forEach(row => {
      const month = row.month_name;
      if (!transformed[month]) {
        transformed[month] = { name: month };
        if (!monthsOrder.includes(month)) monthsOrder.push(month);
      }
      transformed[month][row.store_name] = Number(row.revenue);
    });
    
    // Return sorted array based on month order
    return monthsOrder.map(month => transformed[month]);
  }

  /**
   * Detallı İstifadəçi Statistikası
   */
  static async getDetailedUserStats() {
    const queryStr = `
      SELECT 
        COUNT(id) as total,
        COUNT(CASE WHEN is_active = true THEN id END) as active,
        COUNT(CASE WHEN is_active = false THEN id END) as inactive,
        COUNT(CASE WHEN role IN ('ADMIN', 'SUPER_ADMIN') THEN id END) as admins,
        COUNT(CASE WHEN role = 'MANAGER' THEN id END) as managers,
        COUNT(CASE WHEN role = 'CASHIER' THEN id END) as cashiers,
        COUNT(CASE WHEN role = 'VIEWER' THEN id END) as viewers,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN id END) as new_this_week,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN id END) as curr_month,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < DATE_TRUNC('month', CURRENT_DATE) THEN id END) as last_month
      FROM "${schemaQualified.replace(/"/g, '')}".users
    `;
    const result = await query(queryStr);
    const row = result.rows[0] || {};

    const curr = Number(row.curr_month || 0);
    const last = Number(row.last_month || 0);
    const growth = last > 0 ? Math.round(((curr - last) / last) * 100) : (curr > 0 ? 100 : 0);

    const stats = {
      total: Number(row.total || 0),
      active: Number(row.active || 0),
      inactive: Number(row.inactive || 0),
      suspended: 0,
      admins: Number(row.admins || 0),
      managers: Number(row.managers || 0),
      cashiers: Number(row.cashiers || 0),
      viewers: Number(row.viewers || 0),
      newThisWeek: Number(row.new_this_week || 0),
      growth
    };

    const roleDistribution = [
      { name: 'Admin', value: stats.admins, color: '#7C3AED' },
      { name: 'Manager', value: stats.managers, color: '#4F46E5' },
      { name: 'Cashier', value: stats.cashiers, color: '#10B981' },
      { name: 'Viewer', value: stats.viewers, color: '#F59E0B' },
    ].filter(r => r.value > 0);

    // Mock activity for now
    const userActivityData = [
      { name: 'B.e', active: 45, new: 2 },
      { name: 'Ç.a', active: 52, new: 3 },
      { name: 'Ç', active: 48, new: 1 },
      { name: 'C.a', active: 58, new: 4 },
      { name: 'C', active: 62, new: 5 },
      { name: 'Ş', active: 55, new: 2 },
      { name: 'B', active: 50, new: 1 },
    ];

    return { stats, roleDistribution, userActivityData };
  }

  /**
   * İstifadəçi artımı (Detallı)
   */
  static async getDetailedUserGrowth() {
    const growthQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as name,
        DATE_TRUNC('month', created_at) as month_date,
        COUNT(id) as users,
        COUNT(CASE WHEN role IN ('ADMIN', 'SUPER_ADMIN') THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'MANAGER' THEN 1 END) as managers,
        COUNT(CASE WHEN role = 'CASHIER' THEN 1 END) as cashiers
      FROM "${schemaQualified.replace(/"/g, '')}".users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(DATE_TRUNC('month', created_at), 'Mon')
      ORDER BY month_date ASC
    `;
    const result = await query(growthQuery);
    return result.rows.map(row => ({
      name: row.name,
      users: Number(row.users),
      admins: Number(row.admins),
      managers: Number(row.managers),
      cashiers: Number(row.cashiers)
    }));
  }

  /**
   * Ən son qeydiyyatdan keçən istifadəçilər
   */
  static async getRecentUsers() {
    const recentQuery = `
      SELECT 
        id,
        name,
        email,
        role,
        is_active,
        TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'DD.MM.YYYY') as date,
        TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'DD.MM.YYYY HH24:MI:SS') as created_at_detailed,
        TO_CHAR(last_login AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'DD.MM.YYYY HH24:MI:SS') as last_login_detailed
      FROM "${schemaQualified.replace(/"/g, '')}".users
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const result = await query(recentQuery);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.is_active ? 'active' : 'inactive',
      date: row.date,
      created_at_detailed: row.created_at_detailed,
      last_login_detailed: row.last_login_detailed || 'Heç vaxt daxil olmayıb'
    }));
  }
}
