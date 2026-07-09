import { Request, Response } from 'express';
import { SecuritySettingModel } from '../models/SecuritySetting.model';
import { errorResponse, successResponse } from '../utils/response';

export class SecuritySettingsController {
  // ==================== GET SETTINGS ====================
  static async getSettings(req: Request, res: Response) {
    try {
      const settings = await SecuritySettingModel.getSettings();
      if (!settings) {
        return errorResponse(res, 'Security settings not found', 404);
      }
      return successResponse(res, settings, 'Security settings retrieved successfully');
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return errorResponse(res, 'Failed to fetch security settings', 500);
    }
  }

  // ==================== UPDATE SETTINGS ====================
  static async updateSettings(req: Request, res: Response) {
    try {
      const updatedSettings = await SecuritySettingModel.updateSettings(req.body);
      if (!updatedSettings) {
        return errorResponse(res, 'Security settings not found', 404);
      }
      return successResponse(res, updatedSettings, 'Security settings updated successfully');
    } catch (error) {
      console.error('Error updating security settings:', error);
      return errorResponse(res, 'Failed to update security settings', 500);
    }
  }
}
