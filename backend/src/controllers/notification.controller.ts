import { Response } from 'express';
import { query } from '../lib/db';
import { AuthRequest } from '../middleware/auth.middleware';

// Default preferences structure
const DEFAULT_PREFS = {
  email: {
    new_order: false,
    daily_report: false,
  },
  sms: {
    updates: false,
    payment_reminder: false,
  },
  push: {
    new_message: false,
    account_activity: false,
  },
};

// GET /api/notifications/preferences
export async function getPreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'İcazə yoxdur' });

    const result = await query(
      `SELECT preferences FROM notification_preferences WHERE user_id = $1`,
      [userId]
    );

    const prefs = result.rows[0]?.preferences ?? DEFAULT_PREFS;

    return res.json({ success: true, data: prefs });
  } catch (err: any) {
    console.error('[NotifPrefs] getPreferences error:', err);
    return res.status(500).json({ success: false, message: 'Server xətası' });
  }
}

// PUT /api/notifications/preferences
export async function updatePreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'İcazə yoxdur' });

    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ success: false, message: 'Keçərsiz məlumat' });
    }

    // Upsert
    await query(
      `INSERT INTO notification_preferences (user_id, preferences, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET preferences = $2, updated_at = NOW()`,
      [userId, JSON.stringify(incoming)]
    );

    return res.json({ success: true, data: incoming, message: 'Bildiriş tənzimləmələri yadda saxlandı' });
  } catch (err: any) {
    console.error('[NotifPrefs] updatePreferences error:', err);
    return res.status(500).json({ success: false, message: 'Server xətası' });
  }
}
