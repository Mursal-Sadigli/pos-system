import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return successResponse(res, result, 'Giriş uğurla həyata keçirildi');
    } catch (error: any) {
      return errorResponse(res, error.message, 401);
    }
  }

  static async changePassword(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'İstifadəçi tapılmadı', 401);
      }

      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);

      return successResponse(res, null, 'Şifrə uğurla dəyişdirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Şifrə dəyişdirilə bilmədi', 400);
    }
  }

  static async invite(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const { name, email, role } = req.body;
      let { storeId } = req.body;

      // 1. If not provided, try to use inviter's storeId (for managers)
      if (!storeId && req.user.storeId && req.user.role !== 'SUPER_ADMIN') {
        storeId = req.user.storeId;
      }

      // 2. If still no storeId and role requires a store, try to use the first store (for super admins)
      if (!storeId && ['MANAGER', 'CASHIER', 'VIEWER'].includes(role)) {
        const StoreService = require('../services/store.service').StoreService;
        const storesResult = await StoreService.getStores({ limit: 1 });
        if (storesResult.stores.length > 0) {
          storeId = storesResult.stores[0].id;
        } else {
          return errorResponse(res, 'Sistemdə heç bir mağaza yoxdur. İşçi dəvət etməzdən əvvəl "Parametrlər" bölməsindən mağaza yaradın.', 400);
        }
      }

      const result = await AuthService.invite({ name, email, role, storeId, invitedBy: req.user.id });
      return successResponse(res, result, 'Dəvət göndərildi', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async acceptInvitation(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const user = await AuthService.acceptInvitation(token);
      return successResponse(res, user, 'Dəvət qəbul edildi');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}
