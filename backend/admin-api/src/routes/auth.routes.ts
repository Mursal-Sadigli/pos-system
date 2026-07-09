import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { loginSchema, inviteSchema, acceptInviteSchema, changePasswordSchema } from '../validations/auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/accept-invite', validate(acceptInviteSchema), AuthController.acceptInvitation);
router.post('/invite', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), validate(inviteSchema), AuthController.invite);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;
