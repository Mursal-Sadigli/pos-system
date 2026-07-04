import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { loginSchema, inviteSchema, acceptInviteSchema, changePasswordSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation';
import { resendInviteSchema } from '../validations/auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/accept-invite', validate(acceptInviteSchema), AuthController.acceptInvitation);
router.get('/accept-invite', AuthController.acceptInviteRedirect);
router.post('/invite', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), validate(inviteSchema), AuthController.invite);
router.post('/invite/resend', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), validate(resendInviteSchema), AuthController.resendInvite);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export default router;
