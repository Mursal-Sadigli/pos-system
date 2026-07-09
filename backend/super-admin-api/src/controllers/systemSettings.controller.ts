import { Request, Response } from 'express';
import { GeneralSettingModel } from '../models/GeneralSetting.model';
import { logger } from '../utils/logger';

export const systemSettingsController = {
  getGeneralSettings: async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = await GeneralSettingModel.getSettings();
      if (!settings) {
        res.status(404).json({ error: 'Settings not found' });
        return;
      }
      res.json(settings);
    } catch (error) {
      logger.error('Error fetching general settings:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  updateGeneralSettings: async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedSettings = await GeneralSettingModel.updateSettings(req.body);
      if (!updatedSettings) {
        res.status(404).json({ error: 'Settings not found to update' });
        return;
      }
      res.json(updatedSettings);
    } catch (error) {
      logger.error('Error updating general settings:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
