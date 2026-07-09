import { query } from "../lib/db";

export interface SecuritySetting {
  id: string;
  twoFactorAuth: boolean;
  passwordComplexity: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  updatedAt: Date;
}

const mapRowToSetting = (row: any): SecuritySetting => ({
  id: row.id,
  twoFactorAuth: row.two_factor_auth,
  passwordComplexity: row.password_complexity,
  sessionTimeout: row.session_timeout,
  maxLoginAttempts: row.max_login_attempts,
  updatedAt: row.updated_at
});

export const SecuritySettingModel = {
  getSettings: async (): Promise<SecuritySetting | null> => {
    const res = await query('SELECT * FROM security_settings LIMIT 1');
    return res.rows[0] ? mapRowToSetting(res.rows[0]) : null;
  },

  updateSettings: async (data: Partial<SecuritySetting>): Promise<SecuritySetting | null> => {
    const dbFields: Record<string, any> = {};
    if (data.twoFactorAuth !== undefined) dbFields['two_factor_auth'] = data.twoFactorAuth;
    if (data.passwordComplexity !== undefined) dbFields['password_complexity'] = data.passwordComplexity;
    if (data.sessionTimeout !== undefined) dbFields['session_timeout'] = data.sessionTimeout;
    if (data.maxLoginAttempts !== undefined) dbFields['max_login_attempts'] = data.maxLoginAttempts;

    const keys = Object.keys(dbFields);
    if (keys.length === 0) {
      return await SecuritySettingModel.getSettings();
    }

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(dbFields);

    const queryText = `
      UPDATE security_settings 
      SET ${setClauses}, updated_at = CURRENT_TIMESTAMP 
      RETURNING *
    `;

    const res = await query(queryText, values);
    return res.rows[0] ? mapRowToSetting(res.rows[0]) : null;
  }
};
