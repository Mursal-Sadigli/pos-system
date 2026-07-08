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

  // GET /api/security/pin/status
  static async getPinStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const status = await SecurityService.getPinStatus(req.user.id);
      return successResponse(res, status);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // POST /api/security/pin/set  { pin, currentPassword }
  static async setPin(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const { pin, currentPassword } = req.body;
      if (!pin || !currentPassword) return errorResponse(res, 'PIN və cari şifrə tələb olunur', 400);
      await SecurityService.setPin(req.user.id, pin, currentPassword);
      await SecurityService.createAuditLog({
        userId: req.user.id,
        action: 'pin_set',
        description: 'Əməliyyat PIN kodu quruldu',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return successResponse(res, null, 'PIN uğurla quruldu');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  // POST /api/security/pin/verify  { pin }
  static async verifyPin(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const { pin } = req.body;
      if (!pin) return errorResponse(res, 'PIN tələb olunur', 400);
      const valid = await SecurityService.verifyPin(req.user.id, pin);
      if (!valid) return errorResponse(res, 'PIN yanlışdır', 400);
      return successResponse(res, { valid: true }, 'PIN doğrulandı');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  // DELETE /api/security/pin  { currentPassword }
  static async removePin(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const { currentPassword } = req.body;
      if (!currentPassword) return errorResponse(res, 'Cari şifrə tələb olunur', 400);
      await SecurityService.removePin(req.user.id, currentPassword);
      await SecurityService.createAuditLog({
        userId: req.user.id,
        action: 'pin_removed',
        description: 'Əməliyyat PIN kodu silindi',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return successResponse(res, null, 'PIN silindi');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}
