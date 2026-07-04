import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Yalnız SUPER_ADMIN və ADMIN dəvət göndərə bilər
router.post(
  '/invite',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  InvitationController.inviteUser
);

export default router;