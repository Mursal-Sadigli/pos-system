import { query } from '../config/database';

export const getSalesSummary = async (storeId?: string, startDate?: string, endDate?: string) => {
  let queryText = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(amount) as total_sales,
      (
        SELECT SUM((i.price - i.cost_price) * i.qty)
        FROM "pos_order_items" i
        JOIN "pos_orders" o2 ON i.order_id = o2.id
        WHERE o2.status != 'cancelled' AND (o2.source = 'POS' OR o2.source = 'Kassa')
        ${storeId ? ` AND o2.store_id = '${storeId}'` : ''}
        ${startDate ? ` AND o2.created_at >= '${startDate}'` : ''}
        ${endDate ? ` AND o2.created_at <= '${endDate} 23:59:59'` : ''}
      ) as total_profit
    FROM "pos_orders"
    WHERE status != 'cancelled' AND (source = 'POS' OR source = 'Kassa')
  `;
  const params: any[] = [];
  
  if (storeId) {
    params.push(storeId);
    queryText += ` AND store_id = $${params.length}`;
  }
  
  if (startDate) {
    params.push(startDate);
    queryText += ` AND created_at >= $${params.length}`;
  }
  
  if (endDate) {
    params.push(`${endDate} 23:59:59`);
    queryText += ` AND created_at <= $${params.length}`;
  }
  
  const result = await query(queryText, params);
  
  // Also get the daily chart data
  let chartQueryText = `
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM-DD') as date,
      SUM(amount) as sales,
      COUNT(*) as count
    FROM "pos_orders"
    WHERE status != 'cancelled' AND (source = 'POS' OR source = 'Kassa')
  `;
  const chartParams: any[] = [];
  
  if (storeId) {
    chartParams.push(storeId);
    chartQueryText += ` AND store_id = $${chartParams.length}`;
  }
  if (startDate) {
    chartParams.push(startDate);
    chartQueryText += ` AND created_at >= $${chartParams.length}`;
  }
  if (endDate) {
    chartParams.push(`${endDate} 23:59:59`);
    chartQueryText += ` AND created_at <= $${chartParams.length}`;
  }
  
  chartQueryText += ` GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD') ORDER BY date ASC LIMIT 30`;
  const chartResult = await query(chartQueryText, chartParams);
  
  // Also get daily summary reports for the table
  let summaryQueryText = `
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM-DD') as date,
      cashier,
      SUM(amount) as total_sales,
      COUNT(*) as total_orders
    FROM "pos_orders"
    WHERE status != 'cancelled' AND (source = 'POS' OR source = 'Kassa')
  `;
  
  const summaryParams: any[] = [];
  if (storeId) {
    summaryParams.push(storeId);
    summaryQueryText += ` AND store_id = $${summaryParams.length}`;
  }
  if (startDate) {
    summaryParams.push(startDate);
    summaryQueryText += ` AND created_at >= $${summaryParams.length}`;
  }
  if (endDate) {
    summaryParams.push(`${endDate} 23:59:59`);
    summaryQueryText += ` AND created_at <= $${summaryParams.length}`;
  }
  
  summaryQueryText += ` GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD'), cashier ORDER BY date DESC LIMIT 50`;
  const summaryResult = await query(summaryQueryText, summaryParams);

  return {
    summary: {
      total_orders: result.rows[0]?.total_orders || 0,
      total_sales: result.rows[0]?.total_sales || 0,
      total_profit: result.rows[0]?.total_profit || 0,
    },
    chartData: chartResult.rows,
    dailyReports: summaryResult.rows,
  };
};

export const getTopProducts = async (storeId?: string, startDate?: string, endDate?: string) => {
  let queryText = `
    SELECT 
      i.name,
      SUM(i.qty) as total_qty,
      SUM(i.qty * i.price) as total_sales
    FROM "pos_order_items" i
    JOIN "pos_orders" o ON i.order_id = o.id
    WHERE o.status != 'cancelled' AND (o.source = 'POS' OR o.source = 'Kassa')
  `;
  const params: any[] = [];
  
  if (storeId) {
    params.push(storeId);
    queryText += ` AND o.store_id = $${params.length}`;
  }
  
  if (startDate) {
    params.push(startDate);
    queryText += ` AND o.created_at >= $${params.length}`;
  }
  
  if (endDate) {
    params.push(`${endDate} 23:59:59`);
    queryText += ` AND o.created_at <= $${params.length}`;
  }
  
  queryText += ` GROUP BY i.name ORDER BY total_qty DESC LIMIT 5`;
  
  const result = await query(queryText, params);
  return result.rows;
};
