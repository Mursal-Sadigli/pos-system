import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { successResponse, errorResponse } from '../utils/response';
import { SecurityService } from '../services/security.service';

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const userReq = (req as any).user;
      const query = req.query;
      
      let storeId = query.storeId as string | undefined;
      if (userReq && userReq.role !== 'SUPER_ADMIN') {
        storeId = userReq.storeId;
      }

      const result = await UserService.getUsers({
        role: query.role as string | undefined,
        storeId: storeId,
        isActive: query.isActive ? query.isActive === 'true' : undefined,
        page: query.page ? parseInt(query.page as string, 10) : 1,
        limit: query.limit ? parseInt(query.limit as string, 10) : 20,
      });
      return successResponse(res, result, 'İstifadəçilər gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'İstifadəçilər gətirilə bilmədi', 500);
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const userReq = (req as any).user;
      const id = req.params.id as string;
      const user = await UserService.getUserById(id);
      if (!user) {
        return errorResponse(res, 'İstifadəçi tapılmadı', 404);
      }
      
      if (userReq && userReq.role !== 'SUPER_ADMIN' && user.store_id !== userReq.storeId) {
        return errorResponse(res, 'İcazəniz yoxdur', 403);
      }
      return successResponse(res, user, 'İstifadəçi tapıldı');
    } catch (error: any) {
      return errorResponse(res, error.message || 'İstifadəçi gətirilə bilmədi', 500);
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userReq = (req as any).user;
      const id = req.params.id as string;
      const updateData = req.body;
      
      if (userReq && userReq.role !== 'SUPER_ADMIN') {
        const existingUser = await UserService.getUserById(id);
        if (!existingUser || existingUser.store_id !== userReq.storeId) {
          return errorResponse(res, 'İcazəniz yoxdur və ya istifadəçi tapılmadı', 403);
        }
      }

      const user = await UserService.updateUser(id, updateData);
      if (!user) {
        return errorResponse(res, 'İstifadəçi tapılmadı və ya yenilənə bilmədi', 404);
      }
      return successResponse(res, user, 'İstifadəçi yeniləndi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'İstifadəçi yenilənə bilmədi', 500);
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const userReq = (req as any).user;
      const id = req.params.id as string;

      if (userReq && userReq.role !== 'SUPER_ADMIN') {
        const existingUser = await UserService.getUserById(id);
        if (!existingUser || existingUser.store_id !== userReq.storeId) {
          return errorResponse(res, 'İcazəniz yoxdur və ya istifadəçi tapılmadı', 403);
        }
      }

      const success = await UserService.deleteUser(id);
      if (!success) {
        return errorResponse(res, 'İstifadəçi tapılmadı və ya silinə bilmədi', 404);
      }
      return successResponse(res, null, 'İstifadəçi silindi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'İstifadəçi silinə bilmədi', 500);
    }
  }
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return errorResponse(res, 'İcazə yoxdur', 401);
      const user = await UserService.getUserById(userId);
      if (!user) return errorResponse(res, 'İstifadəçi tapılmadı', 404);
      return successResponse(res, user, 'Profil gətirildi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Profil gətirilə bilmədi', 500);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return errorResponse(res, 'İcazə yoxdur', 401);
      const updateData = req.body;
      const user = await UserService.updateUser(userId, updateData);
      if (!user) return errorResponse(res, 'İstifadəçi tapılmadı və ya yenilənə bilmədi', 404);
      return successResponse(res, user, 'Profil yeniləndi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Profil yenilənə bilmədi', 500);
    }
  }

  static async updatePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return errorResponse(res, 'İcazə yoxdur', 401);
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Cari şifrə və yeni şifrə tələb olunur', 400);
      }
      const user = await UserService.getUserById(userId);
      if (!user) return errorResponse(res, 'İstifadəçi tapılmadı', 404);

      // Verify current password
      const { comparePassword, hashPassword } = await import('../utils/bcrypt');
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return errorResponse(res, 'Cari şifrə yanlışdır', 400);
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      await UserService.updateUser(userId, { password: hashedPassword });

      // Audit log
      await SecurityService.createAuditLog({
        userId,
        action: 'password_changed',
        description: 'Şifrə dəyişdirildi',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Şifrə yeniləndi');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Şifrə yenilənə bilmədi', 500);
    }
  }
}
