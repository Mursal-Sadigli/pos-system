import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// 2FA
router.get('/2fa/status', SecurityController.get2FAStatus);
router.post('/2fa/generate', SecurityController.generate2FA);
router.post('/2fa/enable', SecurityController.enable2FA);
router.post('/2fa/disable', SecurityController.disable2FA);

// Sessions
router.post('/revoke-sessions', SecurityController.revokeAllSessions);

// Audit logs
router.get('/audit-logs', SecurityController.getAuditLogs);

// PIN
router.get('/pin/status', SecurityController.getPinStatus);
router.post('/pin/set', SecurityController.setPin);
router.post('/pin/verify', SecurityController.verifyPin);
router.delete('/pin', SecurityController.removePin);

export default router;
