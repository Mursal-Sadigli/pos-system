import { query } from '../config/database';

export interface GeneralSetting {
  id: string;
  systemName: string;
  defaultLanguage: string;
  defaultTimezone: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  enableEmailNotifications: boolean;
  updatedAt: Date;
}

const mapRowToSetting = (row: any): GeneralSetting => ({
  id: row.id,
  systemName: row.system_name,
  defaultLanguage: row.default_language,
  defaultTimezone: row.default_timezone,
  defaultCurrency: row.default_currency,
  maintenanceMode: row.maintenance_mode,
  allowRegistration: row.allow_registration,
  enableEmailNotifications: row.enable_email_notifications,
  updatedAt: row.updated_at,
});

export const GeneralSettingModel = {
  getSettings: async (): Promise<GeneralSetting | null> => {
    const res = await query('SELECT * FROM general_settings LIMIT 1');
    return res.rows[0] ? mapRowToSetting(res.rows[0]) : null;
  },

  updateSettings: async (settings: Partial<GeneralSetting>): Promise<GeneralSetting | null> => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (settings.systemName !== undefined) {
      updates.push(`system_name = $${paramIndex++}`);
      values.push(settings.systemName);
    }
    if (settings.defaultLanguage !== undefined) {
      updates.push(`default_language = $${paramIndex++}`);
      values.push(settings.defaultLanguage);
    }
    if (settings.defaultTimezone !== undefined) {
      updates.push(`default_timezone = $${paramIndex++}`);
      values.push(settings.defaultTimezone);
    }
    if (settings.defaultCurrency !== undefined) {
      updates.push(`default_currency = $${paramIndex++}`);
      values.push(settings.defaultCurrency);
    }
    if (settings.maintenanceMode !== undefined) {
      updates.push(`maintenance_mode = $${paramIndex++}`);
      values.push(settings.maintenanceMode);
    }
    if (settings.allowRegistration !== undefined) {
      updates.push(`allow_registration = $${paramIndex++}`);
      values.push(settings.allowRegistration);
    }
    if (settings.enableEmailNotifications !== undefined) {
      updates.push(`enable_email_notifications = $${paramIndex++}`);
      values.push(settings.enableEmailNotifications);
    }

    if (updates.length === 0) return GeneralSettingModel.getSettings();

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const queryStr = `
      UPDATE general_settings
      SET ${updates.join(', ')}
      RETURNING *;
    `;

    const res = await query(queryStr, values);
    return res.rows[0] ? mapRowToSetting(res.rows[0]) : null;
  }
};
