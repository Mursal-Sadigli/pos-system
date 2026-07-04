import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { InvitationService } from '../services/invitation.service';
import { successResponse, errorResponse } from '../utils/response';

export class InvitationController {
  static async inviteUser(req: AuthRequest, res: Response) {
    try {
      const { name, email, role, storeId } = req.body;
      const invitedBy = req.user?.id;
      
      if (!invitedBy) {
        return errorResponse(res, 'İcazə verilmədi', 401);
      }
      
      const result = await InvitationService.inviteUser({
        name,
        email,
        role,
        storeId,
        invitedBy,
      });
      
      return successResponse(
        res,
        {
          invitation: result.invitation,
          password: result.password,
        },
        'İstifadəçi uğurla dəvət edildi',
        201
      );
    } catch (error) {
      return errorResponse(
        res,
        error instanceof Error ? error.message : 'Dəvət göndərilmədi',
        400
      );
    }
  }
}