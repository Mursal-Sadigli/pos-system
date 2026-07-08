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
const rpID = process.env.NODE_ENV === 'production' ? process.env.DOMAIN || 'localhost' : 'localhost';
const expectedOrigin = process.env.NODE_ENV === 'production' ? `https://${rpID}` : 'http://localhost:3000';

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

  // ─── WebAuthn / Passkeys ──────────────────────────────────────────

  static async getPasskeyStatus(userId: string) {
    const res = await query(
      `SELECT COUNT(*) as count FROM ${schemaQualified}.passkeys WHERE user_id = $1`,
      [userId]
    );
    return { hasPasskey: parseInt(res.rows[0].count, 10) > 0 };
  }

  static async generateRegistrationOptions(userId: string, email: string) {
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

  static async verifyRegistrationResponse(userId: string, body: any) {
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

  static async generateAuthenticationOptions(userId: string) {
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

  static async verifyAuthenticationResponse(userId: string, body: any) {
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
}
