import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { emitNotification } from '../socket/index';

const router = Router();

// GET  /api/notifications/preferences  — istifadəçinin tənzimləmələrini gətir
router.get('/preferences', authenticate, getPreferences);

// PUT  /api/notifications/preferences  — tənzimləmələri yadda saxla
router.put('/preferences', authenticate, updatePreferences);

// POST /api/notifications — birbaşa socket emit (test / admin işi)
router.post('/', (req, res) => {
  const { userId, title, message, type, data } = req.body;
  if (!userId || !title) {
    return res.status(400).json({ success: false, message: '`userId` və `title` tələb olunur' });
  }
  emitNotification(userId, { title, message, type, data });
  return res.status(201).json({
    success: true,
    message: 'Bildiriş göndərildi',
    data: { userId, title, message, type, sentAt: new Date().toISOString() },
  });
});

export default router;
