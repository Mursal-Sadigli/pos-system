import { query, schemaQualified } from '../config/database';
import os from 'os';

export class HelpService {
  // ─── FAQs ────────────────────────────────────────────────────────
  static async getFaqs() {
    const result = await query(
      `SELECT id, question, answer, category 
       FROM ${schemaQualified}.faqs 
       ORDER BY created_at ASC`
    );
    return result.rows;
  }

  // ─── Support Tickets ─────────────────────────────────────────────
  static async createTicket(storeId: string, userId: string, subject: string, message: string) {
    const result = await query(
      `INSERT INTO ${schemaQualified}.support_tickets (store_id, user_id, subject, message, status)
       VALUES ($1, $2, $3, $4, 'open')
       RETURNING id, subject, status, to_char(created_at, 'DD/MM/YYYY HH24:MI') as created_at`,
      [storeId, userId, subject, message]
    );
    return result.rows[0];
  }

  static async getTickets(storeId: string, userId: string) {
    const result = await query(
      `SELECT id, subject, message, status, 
              to_char(created_at, 'DD/MM/YYYY HH24:MI') as created_at
       FROM ${schemaQualified}.support_tickets
       WHERE store_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [storeId, userId]
    );
    return result.rows;
  }

  // ─── System Info ────────────────────────────────────────────────
  static getSystemInfo() {
    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    return {
      version: process.env.npm_package_version || '2.1.4',
      status: 'Əla',
      uptime: `${days} gün, ${hours} saat, ${minutes} dəqiqə`,
      lastUpdate: new Date().toLocaleString('az-AZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      releaseNotes: [
        'Dinamik Yardım və Dəstək Mərkəzi əlavə edildi',
        'Təhlükəsizlik və Log sistemi optimallaşdırıldı',
        'Passkey və 2FA təkmilləşdirildi',
      ],
    };
  }
}
