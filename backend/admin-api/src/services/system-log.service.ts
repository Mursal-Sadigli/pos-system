import { query, schemaQualified } from '../config/database';

export class SystemLogService {
  /**
   * Log a system event or error
   */
  static async logEvent(level: 'info' | 'warning' | 'error' | 'critical', source: string, message: string, meta: any = null) {
    try {
      await query(
        `INSERT INTO public.system_logs (level, source, message, meta)
         VALUES ($1, $2, $3, $4)`,
        [level, source, message, meta ? JSON.stringify(meta) : null]
      );
    } catch (error) {
      console.error('Failed to write to system_logs table:', error);
    }
  }

  /**
   * Get system logs for Super Admin
   */
  static async getLogs(options: { limit?: number; offset?: number; search?: string; type?: string; status?: string }) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    
    let queryStr = `
      SELECT 
        id, 
        level, 
        source, 
        message, 
        meta,
        TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'DD.MM.YYYY HH24:MI:SS') as created_at_detailed
      FROM public.system_logs
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Filters mapped from frontend's "status" (success/error/warning) and "type"
    if (options.status && options.status !== 'all') {
      let dbLevel = 'info';
      if (options.status === 'error') dbLevel = 'error';
      else if (options.status === 'warning') dbLevel = 'warning';
      
      queryStr += ` AND level = $${paramIndex}`;
      params.push(dbLevel);
      paramIndex++;
    }

    if (options.type && options.type !== 'all') {
      queryStr += ` AND source = $${paramIndex}`;
      params.push(options.type);
      paramIndex++;
    }

    if (options.search) {
      queryStr += ` AND (message ILIKE $${paramIndex} OR meta::text ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    // Count total for pagination/stats
    const countQuery = `SELECT COUNT(*) FROM public.system_logs WHERE 1=1` + queryStr.split('WHERE 1=1')[1];
    const totalResult = await query(countQuery, params);
    const total = parseInt(totalResult.rows[0].count, 10);

    queryStr += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryStr, params);

    // Get simple stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN level = 'info' THEN 1 END) as success,
        COUNT(CASE WHEN level = 'error' OR level = 'critical' THEN 1 END) as error,
        COUNT(CASE WHEN level = 'warning' THEN 1 END) as warning
      FROM public.system_logs
    `);

    return {
      logs: result.rows,
      total,
      stats: statsResult.rows[0]
    };
  }
}
