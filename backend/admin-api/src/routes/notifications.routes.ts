import { Router } from 'express';
import { getNotifPreferences, updateNotifPreferences } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET  /api/notifications/preferences
router.get('/preferences', authenticate, getNotifPreferences);

// PUT  /api/notifications/preferences
router.put('/preferences', authenticate, updateNotifPreferences);

export default router;
