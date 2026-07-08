import { Request, Response } from 'express';
import { emitNotification } from '../socket/index';

/**
 * POST /api/notifications
 * Body: { userId, title, message?, type? }
 *
 * Bu endpoint bildiriş yaradır və socket vasitəsilə istifadəçiyə göndərir.
 */
export async function createNotification(req: Request, res: Response) {
  try {
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
  } catch (err: any) {
    console.error('[NotificationController] Error:', err);
    return res.status(500).json({ success: false, message: 'Server xətası' });
  }
}
