import { Response } from 'express';
import { query, schemaQualified } from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

// Default preferences
const DEFAULT_PREFS = {
  email: { new_order: false, daily_report: false },
  sms: { updates: false, payment_reminder: false },
  push: { new_message: false, account_activity: false },
};

/**
 * GET /api/notifications/preferences
 * İstifadəçinin bildiriş tənzimləmələrini gətir
 */
export async function getNotifPreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, 'İcazə yoxdur', 401);

    const result = await query(
      `SELECT preferences FROM ${schemaQualified}.notification_preferences WHERE user_id = $1`,
      [userId]
    );

    const prefs = result.rows[0]?.preferences ?? DEFAULT_PREFS;
    return successResponse(res, prefs, 'Bildiriş tənzimləmələri gətirildi');
  } catch (err: any) {
    return errorResponse(res, 'Server xətası: ' + err.message, 500);
  }
}

/**
 * PUT /api/notifications/preferences
 * İstifadəçinin bildiriş tənzimləmələrini yadda saxla
 */
export async function updateNotifPreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, 'İcazə yoxdur', 401);

    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      return errorResponse(res, 'Keçərsiz məlumat', 400);
    }

    await query(
      `INSERT INTO ${schemaQualified}.notification_preferences (user_id, preferences, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET preferences = $2, updated_at = NOW()`,
      [userId, JSON.stringify(incoming)]
    );

    return successResponse(res, incoming, 'Bildiriş tənzimləmələri yadda saxlandı');
  } catch (err: any) {
    return errorResponse(res, 'Server xətası: ' + err.message, 500);
  }
}
