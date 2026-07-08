import { Response } from 'express';
import { SecurityService } from '../services/security.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class SecurityController {
  // GET /api/security/2fa/status
  static async get2FAStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const status = await SecurityService.get2FAStatus(req.user.id);
      return successResponse(res, status);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // POST /api/security/2fa/generate
  static async generate2FA(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const result = await SecurityService.generate2FASecret(req.user.id, req.user.email);
      return successResponse(res, result, 'QR kod hazırlandı');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // POST /api/security/2fa/enable  { token: "123456" }
  static async enable2FA(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const { token } = req.body;
      if (!token) return errorResponse(res, 'Kod tələb olunur', 400);
      await SecurityService.enable2FA(req.user.id, token);

      // Write audit log
      await SecurityService.createAuditLog({
        userId: req.user.id,
        action: '2fa_enabled',
        description: 'İki faktorlu təsdiqləmə aktivləşdirildi',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return successResponse(res, null, '2FA uğurla aktivləşdirildi');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  // POST /api/security/2fa/disable  { password: "..." }
  static async disable2FA(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const { password } = req.body;
      if (!password) return errorResponse(res, 'Şifrə tələb olunur', 400);
      await SecurityService.disable2FA(req.user.id, password);

      await SecurityService.createAuditLog({
        userId: req.user.id,
        action: '2fa_disabled',
        description: 'İki faktorlu təsdiqləmə deaktiv edildi',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return successResponse(res, null, '2FA deaktiv edildi');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  // POST /api/security/revoke-sessions
  static async revokeAllSessions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      await SecurityService.revokeAllSessions(req.user.id);

      await SecurityService.createAuditLog({
        userId: req.user.id,
        action: 'sessions_revoked',
        description: 'Bütün aktiv sessiyalar ləğv edildi',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Bütün sessiyalar ləğv edildi');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // GET /api/security/audit-logs
  static async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const logs = await SecurityService.getAuditLogs(req.user.id, limit);
      return successResponse(res, { logs });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // GET /api/security/system-logs
  static async getSystemLogs(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      if (!req.user.storeId) return errorResponse(res, 'Store ID required', 403);
      
      // Only Admins and Managers should see system logs
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return errorResponse(res, 'Səlahiyyətiniz yoxdur', 403);
      }

      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);
      const search = (req.query.search as string) || '';

      const data = await SecurityService.getSystemLogs(req.user.storeId, search, limit, offset);
      return successResponse(res, data);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // ─── WebAuthn / Passkeys ──────────────────────────────────────────

  static async getPasskeyStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const status = await SecurityService.getPasskeyStatus(req.user.id);
      return successResponse(res, status);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async deletePasskeys(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      await SecurityService.deletePasskeys(req.user.id);
      
      await SecurityService.createAuditLog({
        userId: req.user.id,
        action: 'passkey_removed',
        description: 'Biometrik təsdiq (Passkey) deaktiv edildi',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Biometrik təsdiq ləğv edildi');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async generateRegistrationOptions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const expectedOrigin = req.headers.origin || 'http://localhost:3000';
      const rpID = new URL(expectedOrigin).hostname;
      const options = await SecurityService.generateRegistrationOptions(req.user.id, req.user.email, rpID);
      return successResponse(res, options);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async verifyRegistrationResponse(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const expectedOrigin = req.headers.origin || 'http://localhost:3000';
      const rpID = new URL(expectedOrigin).hostname;
      const verified = await SecurityService.verifyRegistrationResponse(req.user.id, req.body, expectedOrigin, rpID);
      if (verified) {
        await SecurityService.createAuditLog({
          userId: req.user.id,
          action: 'passkey_added',
          description: 'Passkey əlavə edildi',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
        return successResponse(res, { verified: true }, 'Passkey uğurla əlavə edildi');
      }
      return errorResponse(res, 'Passkey doğrulanmadı', 400);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async generateAuthenticationOptions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const expectedOrigin = req.headers.origin || 'http://localhost:3000';
      const rpID = new URL(expectedOrigin).hostname;
      const options = await SecurityService.generateAuthenticationOptions(req.user.id, rpID);
      return successResponse(res, options);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async verifyAuthenticationResponse(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const expectedOrigin = req.headers.origin || 'http://localhost:3000';
      const rpID = new URL(expectedOrigin).hostname;
      const verified = await SecurityService.verifyAuthenticationResponse(req.user.id, req.body, expectedOrigin, rpID);
      if (verified) {
        return successResponse(res, { verified: true }, 'Təsdiqləndi');
      }
      return errorResponse(res, 'Doğrulama uğursuz oldu', 400);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async revokeSessionsWithPasskey(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      
      const { assertion } = req.body;
      if (!assertion) return errorResponse(res, 'Passkey assertion tələb olunur', 400);

      const expectedOrigin = req.headers.origin || 'http://localhost:3000';
      const rpID = new URL(expectedOrigin).hostname;

      const verified = await SecurityService.verifyAuthenticationResponse(req.user.id, assertion, expectedOrigin, rpID);
      if (!verified) return errorResponse(res, 'Passkey təsdiqlənmədi', 400);

      // Perform revocation
      const newVersion = await SecurityService.revokeAllSessions(req.user.id);
      
      await SecurityService.createAuditLog({
        userId: req.user.id,
        action: 'sessions_revoked',
        description: 'Bütün sessiyalar ləğv edildi (Passkey təsdiqi ilə)',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return successResponse(res, { newVersion }, 'Sessiyalar ləğv edildi');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

