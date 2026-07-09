import { Request, Response } from 'express';
import { GeneralSettingModel } from '../models/GeneralSetting.model';

export const systemSettingsController = {
  getGeneralSettings: async (req: Request, res: Response) => {
    try {
      const settings = await GeneralSettingModel.getSettings();
      if (!settings) {
        return res.status(404).json({ error: 'Settings not found' });
      }
      res.json(settings);
    } catch (error) {
      console.error('Error fetching general settings:', error);
      res.status(500).json({ error: 'Server error while fetching settings' });
    }
  },

  updateGeneralSettings: async (req: Request, res: Response) => {
    try {
      const updated = await GeneralSettingModel.updateSettings(req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating general settings:', error);
      res.status(500).json({ error: 'Server error while updating settings' });
    }
  }
};
