import { Router } from 'express';
import { createNotification } from '../controllers/notification.controller';

const router = Router();

// POST /api/notifications
router.post('/', createNotification);

export default router;
