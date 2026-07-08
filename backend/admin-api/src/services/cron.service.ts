import cron from 'node-cron';
import pool from '../config/database';
import { ReportService } from './report.service';
import { EmailService } from './email.service';

export class CronService {
  static init() {
    console.log('[CronService] Initializing scheduled tasks...');

    // Daily Sales Report - Runs every day at 23:59
    cron.schedule('59 23 * * *', async () => {
      console.log('[Cron] Running daily sales report job...');
      await this.runDailySalesReports();
    });

    // Weekly Inventory Report - Runs every Sunday at 23:59
    cron.schedule('59 23 * * 0', async () => {
      console.log('[Cron] Running weekly inventory report job...');
      await this.runWeeklyInventoryReports();
    });
  }

  private static async runDailySalesReports() {
    try {
      const { rows } = await pool.query(`
        SELECT u.id, u.email, u.store_id, np.preferences
        FROM users u
        JOIN notification_preferences np ON u.id = np.user_id
        WHERE np.preferences->'reports'->>'auto_daily' = 'true'
      `);

      if (rows.length === 0) return;

      const date = new Date().toISOString().split('T')[0];

      for (const user of rows) {
        if (!user.email || !user.store_id) continue;
        
        const data = await ReportService.getSalesSummary({ startDate: date, endDate: date, storeId: user.store_id });
        
        const emailHtml = `
          <h2>Gündəlik Satış Xülasəsi (${date})</h2>
          <p>Aşağıda gün ərzindəki satışların qısa xülasəsi qeyd olunmuşdur:</p>
          <ul>
            <li><strong>Ümumi Dövriyyə:</strong> ₼${data.summary.total_sales.toFixed(2)}</li>
            <li><strong>Xalis Mənfəət:</strong> ₼${data.summary.total_profit.toFixed(2)}</li>
            <li><strong>Sifariş Sayı:</strong> ${data.summary.total_orders}</li>
          </ul>
          <p>Daha ətraflı məlumat üçün sistemə daxil olaraq Hesabatlar bölməsinə baxa bilərsiniz.</p>
        `;

        await EmailService.sendEmail({
          to: user.email,
          subject: 'Gündəlik Satış Hesabatı - ' + date,
          html: emailHtml
        });
        console.log('[Cron] Daily report sent to ' + user.email);
      }
    } catch (err) {
      console.error('[Cron] Error running daily sales report:', err);
    }
  }

  private static async runWeeklyInventoryReports() {
    try {
      const { rows } = await pool.query(`
        SELECT u.id, u.email, u.store_id, np.preferences
        FROM users u
        JOIN notification_preferences np ON u.id = np.user_id
        WHERE np.preferences->'reports'->>'auto_weekly' = 'true'
      `);

      if (rows.length === 0) return;

      for (const user of rows) {
        if (!user.email || !user.store_id) continue;
        
        const data = await ReportService.getInventoryReport(user.store_id);

        const emailHtml = `
          <h2>Həftəlik İnventar Vəziyyəti</h2>
          <p>Aşağıda anbarınızın cari vəziyyəti qeyd olunmuşdur:</p>
          <ul>
            <li><strong>Ümumi Məhsul Çeşidi:</strong> ${data.summary.total_products}</li>
            <li><strong>Ümumi Məhsul Sayı:</strong> ${data.summary.total_items}</li>
            <li><strong style="color: #f59e0b;">Azalan Məhsullar:</strong> ${data.lowStock.length}</li>
            <li><strong style="color: #ef4444;">Bitmiş Məhsullar:</strong> ${data.outOfStock.length}</li>
          </ul>
          <p>Bitmək üzrə olan məhsulları yoxlamaq üçün sistemə daxil olaraq "Azalan Məhsullar" bölməsinə keçid edin.</p>
        `;

        await EmailService.sendEmail({
          to: user.email,
          subject: 'Həftəlik İnventar Hesabatı',
          html: emailHtml
        });
        console.log('[Cron] Weekly inventory report sent to ' + user.email);
      }
    } catch (err) {
      console.error('[Cron] Error running weekly inventory report:', err);
    }
  }
}
