import { query } from "../lib/db";

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
  updatedAt: row.updated_at
});

export const GeneralSettingModel = {
  getSettings: async (): Promise<GeneralSetting | null> => {
    const res = await query('SELECT * FROM general_settings LIMIT 1');
    return res.rows[0] ? mapRowToSetting(res.rows[0]) : null;
  },

  updateSettings: async (data: Partial<GeneralSetting>): Promise<GeneralSetting | null> => {
    const dbFields: Record<string, any> = {};
    if (data.systemName !== undefined) dbFields['system_name'] = data.systemName;
    if (data.defaultLanguage !== undefined) dbFields['default_language'] = data.defaultLanguage;
    if (data.defaultTimezone !== undefined) dbFields['default_timezone'] = data.defaultTimezone;
    if (data.defaultCurrency !== undefined) dbFields['default_currency'] = data.defaultCurrency;
    if (data.maintenanceMode !== undefined) dbFields['maintenance_mode'] = data.maintenanceMode;
    if (data.allowRegistration !== undefined) dbFields['allow_registration'] = data.allowRegistration;
    if (data.enableEmailNotifications !== undefined) dbFields['enable_email_notifications'] = data.enableEmailNotifications;

    const keys = Object.keys(dbFields);
    if (keys.length === 0) {
      return await GeneralSettingModel.getSettings();
    }

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(dbFields);

    const queryText = `
      UPDATE general_settings 
      SET ${setClauses}, updated_at = CURRENT_TIMESTAMP 
      RETURNING *
    `;

    const res = await query(queryText, values);
    return res.rows[0] ? mapRowToSetting(res.rows[0]) : null;
  }
};
