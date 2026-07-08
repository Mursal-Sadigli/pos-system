import { Response } from 'express';
import { ReportService } from '../services/report.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { EmailService } from '../services/email.service';

export class ReportController {
  /**
   * GET /api/reports/summary
   */
  static async getSalesSummary(req: AuthRequest, res: Response) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return errorResponse(res, 'Mağaza ID tapılmadı', 400);
      }

      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

      const result = await ReportService.getSalesSummary({
        startDate,
        endDate,
        storeId,
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
      const storeId = req.user?.storeId;
      if (!storeId) {
        return errorResponse(res, 'Mağaza ID tapılmadı', 400);
      }

      const { startDate, endDate, limit } = req.query as { startDate?: string; endDate?: string; limit?: string };

      const result = await ReportService.getTopProducts({
        startDate,
        endDate,
        storeId,
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
      const storeId = req.user?.storeId;
      if (!storeId) {
        return errorResponse(res, 'Mağaza ID tapılmadı', 400);
      }

      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

      const result = await ReportService.getByCategory({
        startDate,
        endDate,
        storeId,
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
      const storeId = req.user?.storeId;
      if (!storeId) {
        return errorResponse(res, 'Mağaza ID tapılmadı', 400);
      }

      const result = await ReportService.getInventoryReport(storeId);
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
      const storeId = req.user?.storeId;
      const userEmail = req.user?.email;
      if (!storeId || !userEmail) {
        return errorResponse(res, 'İstifadəçi məlumatları tapılmadı', 400);
      }

      const { type, startDate, endDate } = req.body as { type: string; startDate?: string; endDate?: string };

      let emailContent = '';
      let subject = 'POS Sistemi - Hesabat';

      if (type === 'sales') {
        const data = await ReportService.getSalesSummary({ startDate, endDate, storeId });
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
        const data = await ReportService.getInventoryReport(storeId);
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
          <h3>Az Qalan Məhsullar</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th>Məhsul</th>
                <th>SKU</th>
                <th>Mövcud Stok</th>
                <th>Min. Limit</th>
              </tr>
            </thead>
            <tbody>
              ${data.lowStock.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.sku}</td>
                  <td>${p.stock}</td>
                  <td>${p.min_stock}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else {
        return errorResponse(res, 'Keçərsiz hesabat növü', 400);
      }

      // Email göndərilməsi
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
}
