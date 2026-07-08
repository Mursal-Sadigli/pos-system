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
router.get('/system-logs', SecurityController.getSystemLogs);

// WebAuthn / Passkeys
router.get('/passkey/status', SecurityController.getPasskeyStatus);
router.delete('/passkey', SecurityController.deletePasskeys);
router.get('/passkey/generate-registration-options', SecurityController.generateRegistrationOptions);
router.post('/passkey/verify-registration', SecurityController.verifyRegistrationResponse);
router.get('/passkey/generate-authentication-options', SecurityController.generateAuthenticationOptions);
router.post('/passkey/verify-authentication', SecurityController.verifyAuthenticationResponse);
router.post('/revoke-sessions-with-passkey', SecurityController.revokeSessionsWithPasskey);

export default router;
