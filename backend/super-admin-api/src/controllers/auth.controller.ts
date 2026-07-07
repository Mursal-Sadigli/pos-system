import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return successResponse(res, result, 'Giriş uğurla həyata keçirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Giriş uğursuz oldu', 401);
    }
  }

  static async acceptInvitation(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const result = await AuthService.acceptInvitation(token);
      return successResponse(res, result, 'Dəvət qəbul edildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Dəvət qəbul edilə bilmədi', 400);
    }
  }

  static async acceptInviteRedirect(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).send('Token tapılmadı');
      }
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const baseUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;
      return res.redirect(`${baseUrl}/accept-invite?token=${token}`);
    } catch (error: any) {
      return res.status(500).send('Redirect error');
    }
  }

  static async invite(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'İstifadəçi tapılmadı', 401);
      }

      const { name, email, role, storeId } = req.body;
      
      if (req.user.role === 'ADMIN' && role === 'ADMIN') {
        return errorResponse(res, 'Sizin Admin rolu əlavə etmək icazəniz yoxdur', 403);
      }

      const result = await AuthService.invite({
        name,
        email,
        role,
        storeId: req.user.role !== 'SUPER_ADMIN' ? req.user.storeId : storeId,
        invitedBy: req.user.id,
      });

      return successResponse(res, result, 'Dəvət göndərildi', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Dəvət göndərilə bilmədi', 400);
    }
  }

  static async resendInvite(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'İstifadəçi tapılmadı', 401);
      }
      const { email } = req.body;
      const result = await AuthService.resendInvite(email, req.user.id);
      return successResponse(res, result, 'Dəvət yenidən göndərildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Dəvət göndərilə bilmədi', 400);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      return successResponse(res, result, 'Token yeniləndi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Token yenilənə bilmədi', 401);
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'İstifadəçi tapılmadı', 401);
      }
      await AuthService.logout(req.user.id);
      return successResponse(res, null, 'Çıxış uğurla həyata keçirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Çıxış uğursuz oldu', 500);
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

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      return successResponse(res, null, 'Şifrəni sıfırlamaq üçün keçid e-poçt ünvanınıza göndərildi.');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Şifrə sıfırlama keçidi göndərilə bilmədi.', 400);
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      return successResponse(res, null, 'Şifrə uğurla yeniləndi.');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Şifrə yenilənə bilmədi.', 400);
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'İstifadəçi tapılmadı', 401);
      }
      const user = await AuthService.getCurrentUser(req.user.id);
      return successResponse(res, user, 'İstifadəçi məlumatları gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'İstifadəçi məlumatları alınmadı', 404);
    }
  }
}
