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

  static async invite(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Authentication required', 401);
      const { name, email, role, storeId } = req.body;
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
