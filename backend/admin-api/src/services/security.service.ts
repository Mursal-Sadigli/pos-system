import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { query, schemaQualified } from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';

export class SecurityService {
  // ─── 2FA ────────────────────────────────────────────────────────────
  static async generate2FASecret(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      name: `POS Sistemi (${email})`,
      length: 20,
    });

    // Save temp secret – not enabled yet until user confirms
    await query(
      `UPDATE ${schemaQualified}.users SET two_factor_secret = $1 WHERE id = $2`,
      [secret.base32, userId]
    );

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    return { secret: secret.base32, qrCodeUrl };
  }

  static async enable2FA(userId: string, token: string): Promise<void> {
    const result = await query(
      `SELECT two_factor_secret FROM ${schemaQualified}.users WHERE id = $1`,
      [userId]
    );
    const user = result.rows[0];
    if (!user?.two_factor_secret) throw new Error('2FA sirri tapılmadı. Yenidən cəhd edin.');

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) throw new Error('Kod yanlışdır. Yenidən cəhd edin.');

    await query(
      `UPDATE ${schemaQualified}.users SET two_factor_enabled = TRUE WHERE id = $1`,
      [userId]
    );
  }

  static async disable2FA(userId: string, password: string): Promise<void> {
    const result = await query(
      `SELECT password FROM ${schemaQualified}.users WHERE id = $1`,
      [userId]
    );
    const user = result.rows[0];
    if (!user) throw new Error('İstifadəçi tapılmadı.');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new Error('Cari şifrə yanlışdır.');

    await query(
      `UPDATE ${schemaQualified}.users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = $1`,
      [userId]
    );
  }

  static async get2FAStatus(userId: string) {
    const result = await query(
      `SELECT two_factor_enabled FROM ${schemaQualified}.users WHERE id = $1`,
      [userId]
    );
    return { enabled: result.rows[0]?.two_factor_enabled || false };
  }

  // ─── Session Revocation ─────────────────────────────────────────────
  static async revokeAllSessions(userId: string): Promise<void> {
    // Bump token_version — any JWT with older version becomes invalid
    await query(
      `UPDATE ${schemaQualified}.users 
       SET token_version = COALESCE(token_version, 0) + 1, refresh_token = NULL 
       WHERE id = $1`,
      [userId]
    );
  }

  // ─── Audit Logs ─────────────────────────────────────────────────────
  static async createAuditLog(data: {
    userId: string;
    action: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await query(
        `INSERT INTO ${schemaQualified}.audit_logs 
         (user_id, action, description, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          data.userId,
          data.action,
          data.description || null,
          data.ipAddress || null,
          data.userAgent || null,
        ]
      );
    } catch {
      // Audit log failures must not crash the main request
    }
  }

  static async getAuditLogs(userId: string, limit = 20) {
    const result = await query(
      // created_at is TIMESTAMP WITHOUT TIME ZONE stored in server local time (Baku UTC+4).
      // We cast to text to prevent the pg driver from incorrectly shifting it as if it were UTC.
      `SELECT id, action, description, ip_address, user_agent,
              to_char(created_at, 'DD/MM/YYYY, HH24:MI') AS created_at
       FROM ${schemaQualified}.audit_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // ─── PIN Code ────────────────────────────────────────────────────────
  static async getPinStatus(userId: string) {
    const result = await query(
      `SELECT pin_code IS NOT NULL AS has_pin FROM ${schemaQualified}.users WHERE id = $1`,
      [userId]
    );
    return { hasPin: result.rows[0]?.has_pin || false };
  }

  static async setPin(userId: string, pin: string, currentPassword: string): Promise<void> {
    if (!/^\d{4,6}$/.test(pin)) throw new Error('PIN 4-6 rəqəmdən ibarət olmalıdır.');

    // Verify current password first
    const res = await query(`SELECT password FROM ${schemaQualified}.users WHERE id = $1`, [userId]);
    const valid = await comparePassword(currentPassword, res.rows[0]?.password || '');
    if (!valid) throw new Error('Cari şifrə yanlışdır.');

    const hashed = await hashPassword(pin);
    await query(
      `UPDATE ${schemaQualified}.users SET pin_code = $1 WHERE id = $2`,
      [hashed, userId]
    );
  }

  static async verifyPin(userId: string, pin: string): Promise<boolean> {
    const res = await query(
      `SELECT pin_code FROM ${schemaQualified}.users WHERE id = $1`,
      [userId]
    );
    const stored = res.rows[0]?.pin_code;
    if (!stored) throw new Error('PIN qurulmayıb.');
    return comparePassword(pin, stored);
  }

  static async removePin(userId: string, currentPassword: string): Promise<void> {
    const res = await query(`SELECT password FROM ${schemaQualified}.users WHERE id = $1`, [userId]);
    const valid = await comparePassword(currentPassword, res.rows[0]?.password || '');
    if (!valid) throw new Error('Cari şifrə yanlışdır.');
    await query(`UPDATE ${schemaQualified}.users SET pin_code = NULL WHERE id = $1`, [userId]);
  }
}
