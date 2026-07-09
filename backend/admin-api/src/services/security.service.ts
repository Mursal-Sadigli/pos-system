import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { query, schemaQualified } from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const rpName = 'POS System';

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
    storeId?: string;
    action: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      let storeId = data.storeId;
      if (!storeId) {
        const u = await query(`SELECT store_id FROM ${schemaQualified}.users WHERE id = $1`, [data.userId]);
        storeId = u.rows[0]?.store_id || null;
      }

      await query(
        `INSERT INTO ${schemaQualified}.audit_logs 
         (user_id, store_id, action, description, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.userId,
          storeId,
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
      `SELECT id, action, description, ip_address, user_agent,
              to_char(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'DD/MM/YYYY, HH24:MI') AS created_at
       FROM ${schemaQualified}.audit_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async getSystemLogs(storeId: string, search: string = '', limit = 50, offset = 0) {
    const params: any[] = [storeId];
    let queryStr = `
       SELECT l.id, l.action, l.description, l.ip_address, l.user_agent,
              to_char(l.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'DD/MM/YYYY HH24:MI') AS timestamp,
              u.first_name, u.last_name, u.role
       FROM ${schemaQualified}.audit_logs l
       JOIN ${schemaQualified}.users u ON l.user_id = u.id
       WHERE l.store_id = $1
    `;

    if (search) {
      queryStr += ` AND (l.action ILIKE $2 OR l.description ILIKE $2 OR u.first_name ILIKE $2 OR u.last_name ILIKE $2)`;
      params.push(`%${search}%`);
    }

    queryStr += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryStr, params);
    
    // Total count query
    let countQuery = `SELECT COUNT(*) FROM ${schemaQualified}.audit_logs l JOIN ${schemaQualified}.users u ON l.user_id = u.id WHERE l.store_id = $1`;
    const countParams = [storeId];
    if (search) {
      countQuery += ` AND (l.action ILIKE $2 OR l.description ILIKE $2 OR u.first_name ILIKE $2 OR u.last_name ILIKE $2)`;
      countParams.push(`%${search}%`);
    }
    const countResult = await query(countQuery, countParams);

    return {
      logs: result.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  // ─── WebAuthn / Passkeys ──────────────────────────────────────────

  static async getPasskeyStatus(userId: string) {
    const res = await query(
      `SELECT COUNT(*) as count FROM ${schemaQualified}.passkeys WHERE user_id = $1`,
      [userId]
    );
    return { hasPasskey: parseInt(res.rows[0].count, 10) > 0 };
  }

  static async deletePasskeys(userId: string) {
    await query(
      `DELETE FROM ${schemaQualified}.passkeys WHERE user_id = $1`,
      [userId]
    );
  }

  static async generateRegistrationOptions(userId: string, email: string, rpID: string) {
    const userPasskeys = await query(
      `SELECT id, transports FROM ${schemaQualified}.passkeys WHERE user_id = $1`,
      [userId]
    );

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: Buffer.from(userId, 'utf-8'),
      userName: email,
      attestationType: 'none',
      excludeCredentials: userPasskeys.rows.map(passkey => ({
        id: passkey.id,
        type: 'public-key',
        transports: passkey.transports ? JSON.parse(passkey.transports) : undefined,
      })),
      authenticatorSelection: {
        residentKey: 'discouraged',
        userVerification: 'preferred',
      },
    });

    // Save challenge
    await query(
      `UPDATE ${schemaQualified}.users SET current_challenge = $1 WHERE id = $2`,
      [options.challenge, userId]
    );

    return options;
  }

  static async verifyRegistrationResponse(userId: string, body: any, expectedOrigin: string, rpID: string) {
    const userRes = await query(
      `SELECT current_challenge FROM ${schemaQualified}.users WHERE id = $1`,
      [userId]
    );
    const expectedChallenge = userRes.rows[0]?.current_challenge;

    if (!expectedChallenge) {
      throw new Error('Registration challenge tapılmadı');
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const credential = verification.registrationInfo.credential;

      await query(
        `INSERT INTO ${schemaQualified}.passkeys 
         (id, user_id, public_key, webauthn_user_id, counter, device_type, backed_up, transports)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          credential.id,
          userId,
          Buffer.from(credential.publicKey), // Store Uint8Array as BYTEA
          userId, // we used the userId as webauthn_user_id
          verification.registrationInfo.credential.counter ?? 0,
          verification.registrationInfo.credentialDeviceType || 'singleDevice',
          verification.registrationInfo.credentialBackedUp || false,
          body.response.transports ? JSON.stringify(body.response.transports) : null
        ]
      );

      // Clear challenge
      await query(
        `UPDATE ${schemaQualified}.users SET current_challenge = NULL WHERE id = $1`,
        [userId]
      );
      return true;
    }
    return false;
  }

  static async generateAuthenticationOptions(userId: string, rpID: string) {
    const userPasskeys = await query(
      `SELECT id, transports FROM ${schemaQualified}.passkeys WHERE user_id = $1`,
      [userId]
    );

    if (userPasskeys.rows.length === 0) {
      throw new Error('Heç bir passkey tapılmadı');
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userPasskeys.rows.map(passkey => ({
        id: passkey.id,
        type: 'public-key',
        transports: passkey.transports ? JSON.parse(passkey.transports) : undefined,
      })),
      userVerification: 'preferred',
    });

    // Save challenge
    await query(
      `UPDATE ${schemaQualified}.users SET current_challenge = $1 WHERE id = $2`,
      [options.challenge, userId]
    );

    return options;
  }

  static async verifyAuthenticationResponse(userId: string, body: any, expectedOrigin: string, rpID: string) {
    const userRes = await query(
      `SELECT current_challenge FROM ${schemaQualified}.users WHERE id = $1`,
      [userId]
    );
    const expectedChallenge = userRes.rows[0]?.current_challenge;

    if (!expectedChallenge) {
      throw new Error('Authentication challenge tapılmadı');
    }

    const passkeyRes = await query(
      `SELECT public_key, counter, transports FROM ${schemaQualified}.passkeys WHERE user_id = $1 AND id = $2`,
      [userId, body.id]
    );

    const passkey = passkeyRes.rows[0];
    if (!passkey) {
      throw new Error('Passkey tapılmadı');
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: body.id,
        publicKey: new Uint8Array(passkey.public_key), // Parse BYTEA to Uint8Array
        counter: Number(passkey.counter),
        transports: passkey.transports ? JSON.parse(passkey.transports) : undefined,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      const { newCounter } = verification.authenticationInfo;

      await query(
        `UPDATE ${schemaQualified}.passkeys SET counter = $1 WHERE id = $2`,
        [newCounter, body.id]
      );

      // Clear challenge
      await query(
        `UPDATE ${schemaQualified}.users SET current_challenge = NULL WHERE id = $1`,
        [userId]
      );

      return true;
    }
    return false;
  }

  static async getSecurityLogs(options: { search?: string; limit?: number; offset?: number; status?: string; severity?: string; timeRange?: string }) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    
    // login_history
    const loginHistoryRes = await query(`
      SELECT 
        lh.id, 
        'Giriş Cəhdi' as event,
        COALESCE(u.name || ' ' || u.last_name, u.name, u.email, 'Bilinmir') as user_name,
        lh.ip_address as ip,
        lh.user_agent as device,
        lh.is_successful,
        lh.failure_reason as details,
        TO_CHAR(lh.login_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'YYYY-MM-DD HH24:MI:SS') as timestamp,
        lh.login_time as sort_time
      FROM public.login_history lh
      LEFT JOIN ${schemaQualified}.users u ON lh.user_id = u.id
      ORDER BY lh.login_time DESC LIMIT 200
    `);

    // audit_logs (security related)
    const auditRes = await query(`
      SELECT 
        al.id,
        al.action as event,
        COALESCE(u.name || ' ' || u.last_name, u.name, u.email, 'Bilinmir') as user_name,
        al.ip_address as ip,
        al.user_agent as device,
        true as is_successful,
        al.description as details,
        TO_CHAR(al.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baku', 'YYYY-MM-DD HH24:MI:SS') as timestamp,
        al.created_at as sort_time
      FROM ${schemaQualified}.audit_logs al
      LEFT JOIN ${schemaQualified}.users u ON al.user_id = u.id
      WHERE al.action IN ('ACCOUNT_LOCKED', 'CHANGE_PASSWORD', 'RESET_PASSWORD', 'ENABLE_2FA', 'DISABLE_2FA')
      ORDER BY al.created_at DESC LIMIT 200
    `);

    let combined: any[] = [];

    // format login logs
    for (const log of loginHistoryRes.rows) {
      combined.push({
        id: log.id,
        event: log.event,
        user: log.user_name,
        ip: log.ip,
        details: log.details || (log.is_successful ? 'Uğurlu giriş' : 'Uğursuz cəhd'),
        severity: log.is_successful ? 'low' : 'high',
        status: log.is_successful ? 'success' : 'failed',
        timestamp: log.timestamp,
        sort_time: new Date(log.sort_time).getTime(),
        device: log.device,
      });
    }

    // format audit logs
    for (const log of auditRes.rows) {
      let eventName = log.event;
      let severity = 'medium';
      let status = 'success';
      
      if (log.event === 'ACCOUNT_LOCKED') { eventName = 'Hesab Bloklandı'; severity = 'critical'; status = 'blocked'; }
      if (log.event === 'CHANGE_PASSWORD') { eventName = 'Şifrə Dəyişdirildi'; }
      if (log.event === 'RESET_PASSWORD') { eventName = 'Şifrə Sıfırlandı'; }
      if (log.event === 'ENABLE_2FA') { eventName = '2FA Aktivləşdirildi'; }
      if (log.event === 'DISABLE_2FA') { eventName = '2FA Deaktiv Edildi'; severity = 'high'; status = 'warning'; }

      combined.push({
        id: log.id,
        event: eventName,
        user: log.user_name,
        ip: log.ip,
        details: log.details,
        severity,
        status,
        timestamp: log.timestamp,
        sort_time: new Date(log.sort_time).getTime(),
        device: log.device,
      });
    }

    // Sort combined by sort_time DESC
    combined.sort((a, b) => b.sort_time - a.sort_time);

    // Apply search/filters
    if (options.search) {
      const s = options.search.toLowerCase();
      combined = combined.filter(c => c.event.toLowerCase().includes(s) || c.user.toLowerCase().includes(s) || (c.details && c.details.toLowerCase().includes(s)));
    }
    if (options.status && options.status !== 'all') {
      combined = combined.filter(c => c.status === options.status);
    }
    if (options.severity && options.severity !== 'all') {
      combined = combined.filter(c => c.severity === options.severity);
    }

    const total = combined.length;
    const paginated = combined.slice(offset, offset + limit);

    return {
      logs: paginated,
      total,
      stats: {
        total,
        critical: combined.filter(l => l.severity === 'critical').length,
        high: combined.filter(l => l.severity === 'high').length,
        failed: combined.filter(l => l.status === 'failed' || l.status === 'blocked').length,
      }
    };
  }
}
