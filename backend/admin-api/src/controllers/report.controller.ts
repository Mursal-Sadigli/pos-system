import { Response } from 'express';
import { ReportService } from '../services/report.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { EmailService } from '../services/email.service';
import { query, schemaQualified } from '../config/database';
import { SystemHealthService } from '../services/system-health.service';

/** Istifadəçinin storeId-ni JWT-dən və ya DB-dən götürür */
async function resolveStoreId(req: AuthRequest): Promise<string | null> {
  if (req.user?.storeId) return req.user.storeId;
  if (!req.user?.id) return null;
  // SUPER_ADMIN üçün DB-dən mağaza tap
  const userRow = await query(`SELECT store_id FROM ${schemaQualified}.users WHERE id = $1`, [req.user.id]);
  if (userRow.rows[0]?.store_id) return userRow.rows[0].store_id;
  // Hər iki halda olmadıqda ilk mağazanı götür
  const storeRow = await query(`SELECT id FROM ${schemaQualified}.stores LIMIT 1`);
  return storeRow.rows[0]?.id || null;
}

export class ReportController {
  /**
   * GET /api/reports/summary
   */
  static async getSalesSummary(req: AuthRequest, res: Response) {
    try {
      const storeId = await resolveStoreId(req);

      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

      const result = await ReportService.getSalesSummary({
        startDate,
        endDate,
        storeId: storeId || undefined,
      });

      return successResponse(res, result, 'Hesabat xülasəsi uğurla gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Hesabat gətirilə bilmədi', 500);
    }
  }

  /**
   * GET /api/reports/top-products
   */
  static async getTopProducts(req: AuthRequest, res: Response) {
    try {
      const storeId = await resolveStoreId(req);

      const { startDate, endDate, limit } = req.query as { startDate?: string; endDate?: string; limit?: string };

      const result = await ReportService.getTopProducts({
        startDate,
        endDate,
        storeId: storeId || undefined,
        limit: limit ? parseInt(limit, 10) : 10,
      });

      return successResponse(res, result, 'Ən çox satılan məhsullar gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Məhsul hesabatı gətirilə bilmədi', 500);
    }
  }

  /**
   * GET /api/reports/by-category
   */
  static async getByCategory(req: AuthRequest, res: Response) {
    try {
      const storeId = await resolveStoreId(req);

      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

      const result = await ReportService.getByCategory({
        startDate,
        endDate,
        storeId: storeId || undefined,
      });

      return successResponse(res, result, 'Kateqoriya hesabatı gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Kateqoriya hesabatı gətirilə bilmədi', 500);
    }
  }

  /**
   * GET /api/reports/inventory
   */
  static async getInventoryReport(req: AuthRequest, res: Response) {
    try {
      const storeId = await resolveStoreId(req);

      const result = await ReportService.getInventoryReport(storeId || '');
      return successResponse(res, result, 'İnventar hesabatı gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'İnventar hesabatı gətirilə bilmədi', 500);
    }
  }

  /**
   * POST /api/reports/send-email
   */
  static async sendReportEmail(req: AuthRequest, res: Response) {
    try {
      const storeId = await resolveStoreId(req);
      const userEmail = req.user?.email;
      if (!userEmail) {
        return errorResponse(res, 'İstifadəçi məlumatları tapılmadı', 400);
      }

      const { type, startDate, endDate } = req.body as { type: string; startDate?: string; endDate?: string };

      let emailContent = '';
      let subject = 'POS Sistemi - Hesabat';

      if (type === 'sales') {
        const data = await ReportService.getSalesSummary({ startDate, endDate, storeId: storeId || undefined });
        subject = `POS Sistemi - Satış Hesabatı (${startDate || 'Bütün Dövr'} - ${endDate || 'Bugün'})`;
        emailContent = `
          <h2>Satış Hesabatı</h2>
          <p><strong>Dövr:</strong> ${startDate || 'Bütün Dövr'} - ${endDate || 'Bugün'}</p>
          <ul>
            <li><strong>Ümumi Satış:</strong> ₼${data.summary.total_sales.toFixed(2)}</li>
            <li><strong>Mənfəət:</strong> ₼${data.summary.total_profit.toFixed(2)}</li>
            <li><strong>Sifariş Sayı:</strong> ${data.summary.total_orders}</li>
            <li><strong>Orta Sifariş Məbləği:</strong> ₼${data.summary.avg_order.toFixed(2)}</li>
          </ul>
          <p>Daha ətraflı idarəetmə panelinə daxil olub baxa bilərsiniz.</p>
        `;
      } else if (type === 'inventory') {
        const data = await ReportService.getInventoryReport(storeId || '');
        subject = `POS Sistemi - İnventar/Stok Hesabatı`;
        emailContent = `
          <h2>Stok Hesabatı</h2>
          <ul>
            <li><strong>Ümumi Məhsul Çeşidi:</strong> ${data.summary.total_products}</li>
            <li><strong>Ümumi Məhsul Sayı:</strong> ${data.summary.total_items}</li>
            <li><strong>Maya Dəyəri ilə Stok Qiyməti:</strong> ₼${data.summary.total_cost_value.toFixed(2)}</li>
            <li><strong>Satış Qiyməti ilə Stok Qiyməti:</strong> ₼${data.summary.total_retail_value.toFixed(2)}</li>
            <li><strong>Az Qalan Məhsul Sayı:</strong> ${data.lowStock.length}</li>
            <li><strong>Bitmiş Məhsul Sayı:</strong> ${data.outOfStock.length}</li>
          </ul>
        `;
      } else {
        return errorResponse(res, 'Keçərsiz hesabat növü', 400);
      }

      await EmailService.sendEmail({
        to: userEmail,
        subject: subject,
        html: emailContent,
      });

      return successResponse(res, null, 'Hesabat email ünvanınıza göndərildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Hesabat göndərilə bilmədi', 500);
    }
  }

  // ==========================================
  // SUPER ADMIN SYSTEM-WIDE REPORTS
  // ==========================================

  static async getSuperAdminSystemSummary(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const result = await ReportService.getSystemSummary();
      return successResponse(res, result, 'Sistem xülasəsi gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Sistem xülasəsi gətirilə bilmədi', 500);
    }
  }

  static async getSuperAdminSystemTrends(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const { period } = req.query as { period?: string };
      const result = await ReportService.getSystemTrends(period);
      return successResponse(res, result, 'Sistem trendləri gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Sistem trendləri gətirilə bilmədi', 500);
    }
  }

  static async getSuperAdminTopStores(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const result = await ReportService.getTopStores();
      return successResponse(res, result, 'Top mağazalar gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Top mağazalar gətirilə bilmədi', 500);
    }
  }

  static async getSuperAdminUserGrowth(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const result = await ReportService.getUserGrowth();
      return successResponse(res, result, 'İstifadəçi artımı gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'İstifadəçi artımı gətirilə bilmədi', 500);
    }
  }

  static async getSuperAdminSystemHealth(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const result = await SystemHealthService.getSystemHealth();
      return successResponse(res, result, 'Sistem performansı gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Sistem performansı gətirilə bilmədi', 500);
    }
  }

  static async getSuperAdminStorePerformance(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const result = await ReportService.getStorePerformanceList();
      return successResponse(res, result, 'Mağazaların reytinqi gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Mağazaların reytinqi gətirilə bilmədi', 500);
    }
  }

  static async getSuperAdminStoreTrends(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const result = await ReportService.getStoreTrendsChart();
      return successResponse(res, result, 'Mağazaların aylıq trendi gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Mağazaların aylıq trendi gətirilə bilmədi', 500);
    }
  }

  static async getSuperAdminUserDetailedStats(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const result = await ReportService.getDetailedUserStats();
      return successResponse(res, result, 'İstifadəçi statistikası gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'İstifadəçi statistikası gətirilə bilmədi', 500);
    }
  }

  static async getSuperAdminUserDetailedGrowth(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const result = await ReportService.getDetailedUserGrowth();
      return successResponse(res, result, 'İstifadəçi artımı qrafiki gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'İstifadəçi artımı gətirilə bilmədi', 500);
    }
  }

  static async getSuperAdminRecentUsers(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') return errorResponse(res, 'İcazəniz yoxdur', 403);
      const result = await ReportService.getRecentUsers();
      return successResponse(res, result, 'Ən son istifadəçilər gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Ən son istifadəçilər gətirilə bilmədi', 500);
    }
  }
}
